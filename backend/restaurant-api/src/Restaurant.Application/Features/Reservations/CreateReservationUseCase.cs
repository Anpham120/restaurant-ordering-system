using Restaurant.Domain.Enums;

namespace Restaurant.Application.Features.Reservations;

public record CreateReservationResult(bool Success, string? ErrorCode, string? ErrorMessage, ReservationDto? Reservation);

public class CreateReservationUseCase(IReservationRepository reservationRepository)
{
    public async Task<CreateReservationResult> ExecuteAsync(CreateReservationRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.CustomerName))
            return new(false, "VALIDATION_ERROR", "Tên khách không được để trống.", null);
        if (string.IsNullOrWhiteSpace(request.Phone))
            return new(false, "VALIDATION_ERROR", "Số điện thoại không được để trống.", null);
        if (request.GuestCount <= 0)
            return new(false, "VALIDATION_ERROR", "Số khách phải lớn hơn 0.", null);
        if (request.ReservationTime <= DateTimeOffset.UtcNow)
            return new(false, "VALIDATION_ERROR", "Thời gian đặt bàn phải ở tương lai.", null);

        string code;
        do
        {
            var datePart = DateTimeOffset.UtcNow.ToString("yyyyMMdd");
            var randPart = Guid.NewGuid().ToString("N")[..6].ToUpper();
            code = $"RSV-{datePart}-{randPart}";
        } while (await reservationRepository.ReservationCodeExistsAsync(code, ct));

        var reservation = new Domain.Entities.Reservation
        {
            Id = Guid.NewGuid(),
            ReservationCode = code,
            CustomerName = request.CustomerName.Trim(),
            Phone = request.Phone.Trim(),
            GuestCount = request.GuestCount,
            ReservationTime = request.ReservationTime,
            Note = request.Note?.Trim(),
            Status = ReservationStatus.Pending.ToString(),
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await reservationRepository.AddReservationAsync(reservation, ct);
        await reservationRepository.SaveChangesAsync(ct);

        return new(true, null, null, ToDto(reservation));
    }

    private static ReservationDto ToDto(Domain.Entities.Reservation r) =>
        new(r.Id, r.ReservationCode, r.CustomerName, r.Phone, r.GuestCount,
            r.ReservationTime, r.Note, r.Status, r.AssignedTableId);
}
