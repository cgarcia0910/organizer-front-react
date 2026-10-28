import { Route, Routes } from "react-router-dom";
import { LoginFeature, ProtectedRoute } from "@react-front/login-feature"
import NxWelcome from "./nx-welcome";

export function App() {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<LoginFeature/>}/>
        <Route element={<ProtectedRoute/>}>
          <Route path="/" element={<NxWelcome title="hello"/>}/>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
