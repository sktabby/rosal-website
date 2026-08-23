// Middleware handles redirecting "/" to /login or the user's role home
// before this ever renders client-side. This file exists so the route is
// valid even if middleware is bypassed (e.g. static export edge cases).
export default function RootPage() {
  return null;
}
