'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const SignupSchema = Yup.object({
  firstName: Yup.string()
    .min(2, 'Too Short!')
    .required('First Name is required'),

  lastName: Yup.string()
    .min(2, 'Too Short!')
    .required('Last Name is required'),

  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),

  dob: Yup.date()
    .required('Date of Birth is required'),

  password: Yup.string()
    .min(8, 'Minimum 8 characters required')
    .required('Password is required'),

  role: Yup.string()
    .required('Role is required'),

  referralCode: Yup.string(),
});

export default function SignupForm() {
  const handleSubmit = (values) => {
    console.log(values);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 md:p-10">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#C0392B]">
            Create Account
          </h1>
          <p className="text-gray-600 mt-2">
            Join us and start your journey today
          </p>
        </div>

        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            dob: '',
            password: '',
            role: '',
            referralCode: '',
          }}
          validationSchema={SignupSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-5">

              {/* First Name & Last Name */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block mb-2 font-medium">
                    First Name
                  </label>
                  <Field
                    name="firstName"
                    placeholder="John"
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F39C12]"
                  />
                  <ErrorMessage
                    name="firstName"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">
                    Last Name
                  </label>
                  <Field
                    name="lastName"
                    placeholder="Doe"
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F39C12]"
                  />
                  <ErrorMessage
                    name="lastName"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block mb-2 font-medium">
                  Email Address
                </label>
                <Field
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F39C12]"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* DOB */}
              <div>
                <label className="block mb-2 font-medium">
                  Date of Birth
                </label>
                <Field
                  type="date"
                  name="dob"
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F39C12]"
                />
                <ErrorMessage
                  name="dob"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block mb-2 font-medium">
                  Password
                </label>
                <Field
                  type="password"
                  name="password"
                  placeholder="********"
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F39C12]"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block mb-2 font-medium">
                  Role
                </label>

                <Field
                  as="select"
                  name="role"
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F39C12]"
                >
                  <option value="">Select Role</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent</option>
                  <option value="admin">Admin</option>
                </Field>

                <ErrorMessage
                  name="role"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Referral Code */}
              <div>
                <label className="block mb-2 font-medium">
                  Referral Code
                </label>
                <Field
                  name="referralCode"
                  placeholder="Optional"
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F39C12]"
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col md:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#F39C12] hover:bg-[#E67E22] text-white font-semibold py-3 rounded-xl transition"
                >
                  Create Account
                </button>

                <button
                  type="reset"
                  className="flex-1 border-2 border-[#F39C12] text-[#F39C12] hover:bg-orange-50 font-semibold py-3 rounded-xl transition"
                >
                  Reset
                </button>
              </div>

              {/* Login Link */}
              <div className="text-center pt-3">
                <span className="text-gray-600">
                  Already have an account?
                </span>

                <button
                  type="button"
                  className="ml-2 text-[#C0392B] font-semibold hover:underline"
                >
                  Login
                </button>
              </div>

            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}