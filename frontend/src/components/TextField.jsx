const BASE_INPUT_CLASSES =
  'block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:ring-2'

const BORDER_CLASSES = {
  error: 'border-red-300 focus:border-red-400 focus:ring-red-100',
  normal: 'border-slate-300 focus:border-indigo-400 focus:ring-indigo-100',
}

export default function TextField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  autoComplete,
  placeholder,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-slate-700"
      >
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={error ? 'true' : 'false'}
        onChange={onChange}
        className={`${BASE_INPUT_CLASSES} ${
          error ? BORDER_CLASSES.error : BORDER_CLASSES.normal
        }`}
      />
      {error && (
        <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  )
}
