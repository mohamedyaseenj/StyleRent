export default function ErrorMessage({ message = 'Something went wrong. Please try again.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-red-50 rounded-full p-6 mb-4">
        <svg className="w-12 h-12 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold font-heading mb-2">Oops!</h3>
      <p className="text-text-light max-w-md mb-6">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          Try Again
        </button>
      )}
    </div>
  )
}
