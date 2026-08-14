export default function RentalSummary({ clothing, startDate, returnDate, rentalDays, pricePerDay, securityDeposit, discount = 0 }) {
  const subtotal = rentalDays * pricePerDay
  const total = subtotal + securityDeposit - discount

  if (!clothing) return null

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold font-heading mb-4">Rental Summary</h3>
      
      <div className="flex gap-4 mb-4">
        <img
          src={clothing.image}
          alt={clothing.name}
          className="w-20 h-20 object-cover rounded-lg"
        />
        <div>
          <h4 className="font-medium">{clothing.name}</h4>
          <p className="text-sm text-text-light">{clothing.category}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm border-t border-border pt-4">
        <div className="flex justify-between">
          <span className="text-text-light">Rental Price</span>
          <span>${pricePerDay}/day</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-light">Duration</span>
          <span>{rentalDays} days</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-light">Rental Period</span>
          <span>{startDate} - {returnDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-light">Subtotal</span>
          <span>${subtotal}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-${discount}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-text-light">Security Deposit</span>
          <span>${securityDeposit}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg border-t border-border pt-2 mt-2">
          <span>Total</span>
          <span className="text-accent">${total}</span>
        </div>
      </div>
    </div>
  )
}
