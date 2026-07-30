import { createBrowserRouter } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import { CartPage } from "@/pages/CartPage"
import { CheckoutPage } from "@/pages/CheckoutPage"
import { LoginPage } from "@/pages/LoginPage"
import { ImmediatePurchasePage } from "@/pages/ImmediatePurchasePage"
import { OfferPurchasePage } from "@/pages/OfferPurchasePage"
import { ProductDetailPage } from "@/pages/ProductDetailPage"
import { ProductListPage } from "@/pages/ProductListPage"
import { PurchasePaymentResultPage } from "@/pages/PurchasePaymentResultPage"
import { ProductSearchPage } from "@/pages/ProductSearchPage"
import { ProfilePage } from "@/pages/ProfilePage"
import { SignUpPage } from "@/pages/SignUpPage"
import { SellerRegistrationPage } from "@/pages/SellerRegistrationPage"

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
        path: "/cart",
        element: <CartPage />,
      },
      {
        path: "/checkout/:productId",
        element: <CheckoutPage />,
      },
      {
        path: "/payments/purchases/:purchaseId",
        element: <PurchasePaymentResultPage />,
      },
      {
        path: "/wallet/charge",
        lazy: async () => {
          const { WalletChargePage } = await import("@/pages/WalletChargePage")
          return { Component: WalletChargePage }
        },
      },
      {
        path: "/wallet/charge/success",
        lazy: async () => {
          const { WalletChargeSuccessPage } = await import(
            "@/pages/WalletChargeSuccessPage"
          )
          return { Component: WalletChargeSuccessPage }
        },
      },
      {
        path: "/wallet/charge/fail",
        lazy: async () => {
          const { WalletChargeFailPage } = await import(
            "@/pages/WalletChargeFailPage"
          )
          return { Component: WalletChargeFailPage }
        },
      },
      {
        path: "/immediate",
        element: <ImmediatePurchasePage />,
      },
      {
        path: "/offers",
        element: <OfferPurchasePage />,
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
        path: "/seller/register",
        element: <SellerRegistrationPage />,
      },
      {
        path: "/sell/products/new",
        lazy: async () => {
          const { ProductCreatePage } = await import(
            "@/pages/ProductCreatePage"
          )
          return { Component: ProductCreatePage }
        },
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
