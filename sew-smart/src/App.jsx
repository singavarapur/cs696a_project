import Routes from "./Routes";
import Navbar from "./components/Navbar";
import CartSidebar from "./components/CartSidebar";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes />
        <CartSidebar />
      </div>
    </CartProvider>
  );
}

export default App;
