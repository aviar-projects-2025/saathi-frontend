// components/Input.jsx

const Input = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
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

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}             
        className={`
          w-full rounded-xl border px-4 py-3
          bg-white
          shadow-sm
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-orange-400
          ${
            error && touched
              ? "border-red-500"
              : "border-gray-300"
          }
        `}
      />

      {error && touched && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;