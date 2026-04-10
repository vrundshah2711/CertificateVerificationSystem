import { BrowserRouter, Routes, Route } from "react-router-dom";
import Search from "./pages/Search";
import Certificate from "./pages/Certificate";
import Login from "./pages/Login";
import RequireRole from "./components/RequireRole.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import ImportExcel from "./pages/admin/ImportExcel.jsx";
import Users from "./pages/admin/Users.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Search />} />
        <Route path="/certificate/:id" element={<Certificate />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <RequireRole allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
              <AdminLayout />
            </RequireRole>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="import" element={<ImportExcel />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;