import { AppProvider, useApp } from './context/AppContext'
import LoginPage from './pages/LoginPage'
import ShopkeeperShell from './ShopkeeperShell'
import CustomerShell from './CustomerShell'

function Router() {
  const { state } = useApp()
  const { session } = state

  if (!session)                       return <LoginPage />
  if (session.type === 'shopkeeper')  return <ShopkeeperShell />
  return <CustomerShell />
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  )
}
