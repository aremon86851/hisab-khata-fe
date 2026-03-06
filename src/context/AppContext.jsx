import { createContext, useContext, useReducer } from 'react'
import { SEED } from '../data/seed'

const AppContext = createContext(null)

const initialState = {
  ...SEED,
  session: null, // { type: 'shopkeeper'|'customer', shopkeeper?, shop?, customer? }
}

function reducer(state, action) {
  switch (action.type) {

    case 'LOGIN':
      return { ...state, session: action.payload }

    case 'LOGOUT':
      return { ...state, session: null }

    case 'ADD_TRANSACTION': {
      const { shopId, customerId, type, amount, note } = action.payload
      const txn = {
        id: 'txn_' + Date.now(),
        shopId, customerId, type, amount,
        note: note || (type === 'baki' ? 'বাকি যোগ' : 'পরিশোধ'),
        date: 'এইমাত্র',
        ts: Date.now(),
      }
      const customers = state.customers.map(c => {
        if (c.id !== customerId) return c
        const cur = c.shopBalances[shopId] || 0
        const next = type === 'baki' ? cur + amount : Math.max(0, cur - amount)
        return { ...c, shopBalances: { ...c.shopBalances, [shopId]: next } }
      })
      return { ...state, customers, transactions: [txn, ...state.transactions] }
    }

    case 'ADD_CUSTOMER': {
      const { shopId, name, mobile } = action.payload
      const newCustomer = {
        id: 'cust_' + Date.now(),
        name, mobile,
        pin: '0000',
        shopBalances: { [shopId]: 0 },
        ratings: { [shopId]: 3 },
      }
      return { ...state, customers: [...state.customers, newCustomer] }
    }

    case 'RATE_CUSTOMER': {
      const { shopId, customerId, rating } = action.payload
      const customers = state.customers.map(c =>
        c.id === customerId
          ? { ...c, ratings: { ...c.ratings, [shopId]: rating } }
          : c
      )
      return { ...state, customers }
    }

    case 'ADD_PRODUCT': {
      const { shopId, product } = action.payload
      const shops = state.shops.map(s =>
        s.id === shopId
          ? { ...s, products: [...s.products, { id: 'p_' + Date.now(), ...product }] }
          : s
      )
      return { ...state, shops }
    }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
