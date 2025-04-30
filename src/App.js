// App.jsx
import { BrowserRouter as Router } from "react-router-dom";
import Guard from "./components/Guard";
import Layout from "./Layout";

function App() {
  return (
    <Router>
      <Guard>
        <Layout />
      </Guard>
    </Router>
  );
}

export default App;
