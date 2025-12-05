import './globals.css'

export const metadata = {
  title: 'Xeno Shopify Insights',
  description: 'Multi-tenant Shopify analytics dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
