// components/Dropdown.jsx

const Dropdown = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  options = [],
  error,
  touched,
  required = false,
}) => {
  return (
    <div className="mb-5">
      <label
        htmlFor={name}
        className="block mb-2 text-sm font-semibold text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`
          w-full rounded-xl border px-4 py-3
          bg-white shadow-sm
          focus:outline-none focus:ring-2 focus:ring-orange-400
          ${
            error && touched
              ? "border-red-500"
              : "border-gray-300"
          }
        `}
      >
        <option value="">Select {label}</option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && touched && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Dropdown;