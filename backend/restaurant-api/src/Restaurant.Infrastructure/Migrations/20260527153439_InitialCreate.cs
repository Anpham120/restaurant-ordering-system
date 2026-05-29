using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Restaurant.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "public");

            migrationBuilder.CreateTable(
                name: "areas",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_areas", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "menu_categories",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    display_order = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_menu_categories", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "roles",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_roles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    full_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tables",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    area_id = table.Column<Guid>(type: "uuid", nullable: false),
                    table_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    capacity = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tables", x => x.id);
                    table.CheckConstraint("ck_tables_capacity", "capacity > 0");
                    table.ForeignKey(
                        name: "fk_tables_areas_area_id",
                        column: x => x.area_id,
                        principalSchema: "public",
                        principalTable: "areas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "menu_items",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    category_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    price = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    image_url = table.Column<string>(type: "text", nullable: true),
                    tags = table.Column<string>(type: "text", nullable: true),
                    is_available = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_menu_items", x => x.id);
                    table.CheckConstraint("ck_menu_items_price", "\"price\" >= 0");
                    table.ForeignKey(
                        name: "fk_menu_items_menu_categories_category_id",
                        column: x => x.category_id,
                        principalSchema: "public",
                        principalTable: "menu_categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ai_chat_logs",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    session_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    question = table.Column<string>(type: "text", nullable: false),
                    answer = table.Column<string>(type: "text", nullable: false),
                    sources = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ai_chat_logs", x => x.id);
                    table.ForeignKey(
                        name: "fk_ai_chat_logs_users_user_id",
                        column: x => x.user_id,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "audit_logs",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    action = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    entity_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    entity_id = table.Column<Guid>(type: "uuid", nullable: true),
                    old_value = table.Column<string>(type: "text", nullable: true),
                    new_value = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_audit_logs", x => x.id);
                    table.ForeignKey(
                        name: "fk_audit_logs_users_user_id",
                        column: x => x.user_id,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "reservations",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    reservation_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    customer_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    guest_count = table.Column<int>(type: "integer", nullable: false),
                    reservation_time = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    note = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    assigned_table_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_reservations", x => x.id);
                    table.CheckConstraint("ck_reservations_guest_count", "guest_count > 0");
                    table.ForeignKey(
                        name: "fk_reservations_tables_assigned_table_id",
                        column: x => x.assigned_table_id,
                        principalSchema: "public",
                        principalTable: "tables",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "table_sessions",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    table_id = table.Column<Guid>(type: "uuid", nullable: false),
                    reservation_id = table.Column<Guid>(type: "uuid", nullable: true),
                    session_token = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    opened_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    closed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_by = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_table_sessions", x => x.id);
                    table.ForeignKey(
                        name: "fk_table_sessions_reservations_reservation_id",
                        column: x => x.reservation_id,
                        principalSchema: "public",
                        principalTable: "reservations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_table_sessions_tables_table_id",
                        column: x => x.table_id,
                        principalSchema: "public",
                        principalTable: "tables",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_table_sessions_users_created_by",
                        column: x => x.created_by,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "invoices",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    table_session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    invoice_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    subtotal = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    discount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    total_amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    payment_method = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    payment_status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    paid_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    cashier_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_invoices", x => x.id);
                    table.CheckConstraint("ck_invoices_discount", "discount >= 0");
                    table.CheckConstraint("ck_invoices_subtotal", "subtotal >= 0");
                    table.CheckConstraint("ck_invoices_total_amount", "total_amount >= 0");
                    table.ForeignKey(
                        name: "fk_invoices_table_sessions_table_session_id",
                        column: x => x.table_session_id,
                        principalSchema: "public",
                        principalTable: "table_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_invoices_users_cashier_id",
                        column: x => x.cashier_id,
                        principalSchema: "public",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "orders",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    table_session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    order_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    idempotency_key = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_orders", x => x.id);
                    table.ForeignKey(
                        name: "fk_orders_table_sessions_table_session_id",
                        column: x => x.table_session_id,
                        principalSchema: "public",
                        principalTable: "table_sessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "order_items",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    order_id = table.Column<Guid>(type: "uuid", nullable: false),
                    menu_item_id = table.Column<Guid>(type: "uuid", nullable: false),
                    menu_item_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    unit_price = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    note = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    started_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    ready_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    served_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_order_items", x => x.id);
                    table.CheckConstraint("ck_order_items_quantity", "quantity > 0");
                    table.CheckConstraint("ck_order_items_unit_price", "unit_price >= 0");
                    table.ForeignKey(
                        name: "fk_order_items_menu_items_menu_item_id",
                        column: x => x.menu_item_id,
                        principalSchema: "public",
                        principalTable: "menu_items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_order_items_orders_order_id",
                        column: x => x.order_id,
                        principalSchema: "public",
                        principalTable: "orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_ai_chat_logs_created_at",
                schema: "public",
                table: "ai_chat_logs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_ai_chat_logs_session_id",
                schema: "public",
                table: "ai_chat_logs",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "ix_ai_chat_logs_user_id",
                schema: "public",
                table: "ai_chat_logs",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_areas_name",
                schema: "public",
                table: "areas",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_created_at",
                schema: "public",
                table: "audit_logs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_entity_name_entity_id",
                schema: "public",
                table: "audit_logs",
                columns: new[] { "entity_name", "entity_id" });

            migrationBuilder.CreateIndex(
                name: "ix_audit_logs_user_id",
                schema: "public",
                table: "audit_logs",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_invoices_cashier_id",
                schema: "public",
                table: "invoices",
                column: "cashier_id");

            migrationBuilder.CreateIndex(
                name: "ix_invoices_invoice_code",
                schema: "public",
                table: "invoices",
                column: "invoice_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_invoices_paid_at",
                schema: "public",
                table: "invoices",
                column: "paid_at");

            migrationBuilder.CreateIndex(
                name: "ix_invoices_payment_status",
                schema: "public",
                table: "invoices",
                column: "payment_status");

            migrationBuilder.CreateIndex(
                name: "ix_invoices_table_session_id",
                schema: "public",
                table: "invoices",
                column: "table_session_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_menu_categories_display_order",
                schema: "public",
                table: "menu_categories",
                column: "display_order");

            migrationBuilder.CreateIndex(
                name: "ix_menu_categories_is_active",
                schema: "public",
                table: "menu_categories",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_menu_categories_name",
                schema: "public",
                table: "menu_categories",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_menu_items_category_id",
                schema: "public",
                table: "menu_items",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "ix_menu_items_is_available",
                schema: "public",
                table: "menu_items",
                column: "is_available");

            migrationBuilder.CreateIndex(
                name: "ix_menu_items_name",
                schema: "public",
                table: "menu_items",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "ix_order_items_created_at",
                schema: "public",
                table: "order_items",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_order_items_menu_item_id",
                schema: "public",
                table: "order_items",
                column: "menu_item_id");

            migrationBuilder.CreateIndex(
                name: "ix_order_items_order_id",
                schema: "public",
                table: "order_items",
                column: "order_id");

            migrationBuilder.CreateIndex(
                name: "ix_order_items_status",
                schema: "public",
                table: "order_items",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_orders_created_at",
                schema: "public",
                table: "orders",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_orders_order_code",
                schema: "public",
                table: "orders",
                column: "order_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_orders_status",
                schema: "public",
                table: "orders",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_orders_table_session_id",
                schema: "public",
                table: "orders",
                column: "table_session_id");

            migrationBuilder.CreateIndex(
                name: "ix_orders_table_session_id_idempotency_key",
                schema: "public",
                table: "orders",
                columns: new[] { "table_session_id", "idempotency_key" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_reservations_assigned_table_id",
                schema: "public",
                table: "reservations",
                column: "assigned_table_id");

            migrationBuilder.CreateIndex(
                name: "ix_reservations_phone",
                schema: "public",
                table: "reservations",
                column: "phone");

            migrationBuilder.CreateIndex(
                name: "ix_reservations_reservation_code",
                schema: "public",
                table: "reservations",
                column: "reservation_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_reservations_reservation_time",
                schema: "public",
                table: "reservations",
                column: "reservation_time");

            migrationBuilder.CreateIndex(
                name: "ix_reservations_status",
                schema: "public",
                table: "reservations",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_roles_name",
                schema: "public",
                table: "roles",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_table_sessions_created_by",
                schema: "public",
                table: "table_sessions",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "ix_table_sessions_reservation_id",
                schema: "public",
                table: "table_sessions",
                column: "reservation_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_table_sessions_session_token",
                schema: "public",
                table: "table_sessions",
                column: "session_token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_table_sessions_status",
                schema: "public",
                table: "table_sessions",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "uq_table_sessions_active_table_id",
                schema: "public",
                table: "table_sessions",
                column: "table_id",
                unique: true,
                filter: "status = 'Active'");

            migrationBuilder.CreateIndex(
                name: "ix_tables_area_id",
                schema: "public",
                table: "tables",
                column: "area_id");

            migrationBuilder.CreateIndex(
                name: "ix_tables_area_id_table_number",
                schema: "public",
                table: "tables",
                columns: new[] { "area_id", "table_number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_tables_status",
                schema: "public",
                table: "tables",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_users_email",
                schema: "public",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_users_is_active",
                schema: "public",
                table: "users",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_users_role",
                schema: "public",
                table: "users",
                column: "role");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ai_chat_logs",
                schema: "public");

            migrationBuilder.DropTable(
                name: "audit_logs",
                schema: "public");

            migrationBuilder.DropTable(
                name: "invoices",
                schema: "public");

            migrationBuilder.DropTable(
                name: "order_items",
                schema: "public");

            migrationBuilder.DropTable(
                name: "roles",
                schema: "public");

            migrationBuilder.DropTable(
                name: "menu_items",
                schema: "public");

            migrationBuilder.DropTable(
                name: "orders",
                schema: "public");

            migrationBuilder.DropTable(
                name: "menu_categories",
                schema: "public");

            migrationBuilder.DropTable(
                name: "table_sessions",
                schema: "public");

            migrationBuilder.DropTable(
                name: "reservations",
                schema: "public");

            migrationBuilder.DropTable(
                name: "users",
                schema: "public");

            migrationBuilder.DropTable(
                name: "tables",
                schema: "public");

            migrationBuilder.DropTable(
                name: "areas",
                schema: "public");
        }
    }
}
