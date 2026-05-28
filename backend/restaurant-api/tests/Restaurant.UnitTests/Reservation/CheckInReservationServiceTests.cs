using Restaurant.Application.Features.Reservations.CheckIn;
using Restaurant.Domain.Entities;
using Restaurant.Domain.Enums;
using RestaurantTable = Restaurant.Domain.Entities.Table;

namespace Restaurant.UnitTests.Reservation;

public sealed class CheckInReservationServiceTests
{
    private static readonly DateTimeOffset Now = new(2026, 5, 27, 8, 0, 0, TimeSpan.Zero);

    [Fact]
    public async Task ExecuteAsync_ConfirmedReservation_PersistsSessionAndOccupiesTable()
    {
        var table = CreateTable();
        var reservation = CreateReservation(table);
        var store = new FakeStore(reservation);
        var service = CreateService(store);

        var result = await service.ExecuteAsync(reservation.Id, Guid.NewGuid(), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("session-token", result.Response!.SessionToken);
        Assert.Equal(TableSessionStatus.Active.ToString(), result.Response.Status);
        Assert.Equal(ReservationStatus.CheckedIn.ToString(), reservation.Status);
        Assert.Equal(TableStatus.Occupied.ToString(), table.Status);
        Assert.NotNull(store.AddedSession);
        Assert.Equal(1, store.SaveCount);
    }

    [Fact]
    public async Task ExecuteAsync_PendingReservation_ReturnsBusinessRuleViolation()
    {
        var reservation = CreateReservation(CreateTable());
        reservation.Status = ReservationStatus.Pending.ToString();
        var store = new FakeStore(reservation);

        var result = await CreateService(store).ExecuteAsync(
            reservation.Id,
            Guid.NewGuid(),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal("BUSINESS_RULE_VIOLATION", result.ErrorCode);
        Assert.Equal(0, store.SaveCount);
    }

    [Fact]
    public async Task ExecuteAsync_TableAlreadyActive_ReturnsConflictWithoutSaving()
    {
        var store = new FakeStore(CreateReservation(CreateTable())) { HasActiveSession = true };

        var result = await CreateService(store).ExecuteAsync(
            Guid.NewGuid(),
            Guid.NewGuid(),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal("CONFLICT", result.ErrorCode);
        Assert.Equal(CheckInFailureType.Conflict, result.FailureType);
        Assert.Null(store.AddedSession);
        Assert.Equal(0, store.SaveCount);
    }

    [Fact]
    public async Task ExecuteAsync_ConcurrentActiveSessionInsert_ReturnsConflict()
    {
        var store = new FakeStore(CreateReservation(CreateTable())) { FailSaveWithActiveSessionConflict = true };

        var result = await CreateService(store).ExecuteAsync(
            Guid.NewGuid(),
            Guid.NewGuid(),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal("CONFLICT", result.ErrorCode);
        Assert.Equal(CheckInFailureType.Conflict, result.FailureType);
        Assert.Equal(1, store.SaveCount);
    }

    private static CheckInReservationService CreateService(FakeStore store) =>
        new(store, new StaticTokenGenerator("session-token"), new FixedTimeProvider(Now));

    private static Restaurant.Domain.Entities.Reservation CreateReservation(RestaurantTable table) =>
        new()
        {
            Id = Guid.NewGuid(),
            ReservationCode = "RSV-0001",
            CustomerName = "Customer",
            Phone = "0900000000",
            GuestCount = 2,
            ReservationTime = Now.AddHours(1),
            Status = ReservationStatus.Confirmed.ToString(),
            AssignedTableId = table.Id,
            AssignedTable = table,
            CreatedAt = Now.AddDays(-1),
            UpdatedAt = Now.AddDays(-1)
        };

    private static RestaurantTable CreateTable() =>
        new()
        {
            Id = Guid.NewGuid(),
            AreaId = Guid.NewGuid(),
            TableNumber = "A01",
            Capacity = 4,
            Status = TableStatus.Reserved.ToString(),
            CreatedAt = Now.AddDays(-1),
            UpdatedAt = Now.AddDays(-1)
        };

    private sealed class FakeStore(Restaurant.Domain.Entities.Reservation reservation) : IReservationCheckInStore
    {
        public bool HasActiveSession { get; init; }

        public bool FailSaveWithActiveSessionConflict { get; init; }

        public TableSession? AddedSession { get; private set; }

        public int SaveCount { get; private set; }

        public Task<Restaurant.Domain.Entities.Reservation?> FindReservationAsync(
            Guid reservationId,
            CancellationToken cancellationToken) =>
            Task.FromResult<Restaurant.Domain.Entities.Reservation?>(reservation);

        public Task<bool> HasActiveSessionAsync(Guid tableId, CancellationToken cancellationToken) =>
            Task.FromResult(HasActiveSession);

        public void Add(TableSession tableSession) => AddedSession = tableSession;

        public Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            SaveCount++;

            if (FailSaveWithActiveSessionConflict)
            {
                throw new ActiveTableSessionConflictException();
            }

            return Task.CompletedTask;
        }
    }

    private sealed class StaticTokenGenerator(string token) : ISessionTokenGenerator
    {
        public string Create() => token;
    }

    private sealed class FixedTimeProvider(DateTimeOffset utcNow) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => utcNow;
    }
}
