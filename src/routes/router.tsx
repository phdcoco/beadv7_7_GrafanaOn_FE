import { createBrowserRouter } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import { LoginPage } from "@/pages/LoginPage"
import { ProductDetailPage } from "@/pages/ProductDetailPage"
import { ProductListPage } from "@/pages/ProductListPage"
import { ProductSearchPage } from "@/pages/ProductSearchPage"
import { ProfilePage } from "@/pages/ProfilePage"
import { SignUpPage } from "@/pages/SignUpPage"

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <ProductListPage />,
      },
      {
        path: "/search",
        element: <ProductSearchPage />,
      },
      {
        path: "/products/:productId",
        element: <ProductDetailPage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/signup",
        element: <SignUpPage />,
      },
    ],
  },
])
