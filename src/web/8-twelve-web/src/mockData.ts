export type Status = 'Completed' | 'Pending' | 'Refunded'
export type Payment = 'Cash' | 'GCash' | 'Maya' | 'Card'
export type Product = { id: number; name: string; category: string; price: number; stock: number; icon: string }
export type User = { id: number; name: string; username: string; email: string; joined: string; active: boolean }
export type Transaction = { id: string; customer: string; userId: number; items: string; amount: number; payment: Payment; date: string; status: Status }

const dateAgo = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export const initialProducts: Product[] = [
  { id: 1, name: 'Coca-Cola Original', category: 'Beverages', price: 35, stock: 48, icon: '🥤' },
  { id: 2, name: 'Jack ’n Jill Chippy', category: 'Snacks', price: 25, stock: 32, icon: '🍿' },
  { id: 3, name: 'Bottled Water', category: 'Beverages', price: 20, stock: 7, icon: '💧' },
  { id: 4, name: 'Lucky Me! Pancit Canton', category: 'Instant Food', price: 22, stock: 24, icon: '🍜' },
  { id: 5, name: 'Cloud 9 Chocolate', category: 'Snacks', price: 18, stock: 5, icon: '🍫' },
  { id: 6, name: 'Gardenia Classic Bread', category: 'Essentials', price: 65, stock: 16, icon: '🍞' },
  { id: 7, name: 'Nescafé Original', category: 'Beverages', price: 18, stock: 40, icon: '☕' },
  { id: 8, name: 'Century Tuna', category: 'Essentials', price: 42, stock: 9, icon: '🥫' },
]

export const initialUsers: User[] = [
  { id: 1, name: 'Maria Santos', username: 'mariasantos', email: 'maria.santos@example.com', joined: '2025-03-15', active: true },
  { id: 2, name: 'John Reyes', username: 'johnreyes', email: 'john.reyes@example.com', joined: '2025-04-02', active: true },
  { id: 3, name: 'Angela Cruz', username: 'angelacruz', email: 'angela.cruz@example.com', joined: '2025-05-21', active: true },
  { id: 4, name: 'Paolo Garcia', username: 'paolog', email: 'paolo.garcia@example.com', joined: '2025-06-11', active: false },
  { id: 5, name: 'Sofia Ramos', username: 'sofiaramos', email: 'sofia.ramos@example.com', joined: '2025-07-08', active: true },
  { id: 6, name: 'Miguel Flores', username: 'miguelf', email: 'miguel.flores@example.com', joined: '2025-08-19', active: true },
  { id: 7, name: 'Isabella Tan', username: 'isabellat', email: 'isabella.tan@example.com', joined: '2025-09-10', active: false },
  { id: 8, name: 'Daniel Lim', username: 'daniellim', email: 'daniel.lim@example.com', joined: '2025-10-12', active: true },
]

const items = ['Coca-Cola Original, Chippy', 'Bottled Water, Pancit Canton', 'Cloud 9 Chocolate, Nescafé', 'Gardenia Classic Bread, Century Tuna', 'Coca-Cola Original, Bottled Water', 'Chippy, Cloud 9 Chocolate']
const payments: Payment[] = ['GCash', 'Cash', 'Maya', 'Card']
export const transactions: Transaction[] = Array.from({ length: 70 }, (_, index) => {
  const user = initialUsers[index % initialUsers.length]
  return {
    id: `TXN-${String(1048 - index).padStart(4, '0')}`,
    customer: user.name,
    userId: user.id,
    items: items[index % items.length],
    amount: [60, 42, 36, 107, 55, 43][index % items.length],
    payment: payments[index % payments.length],
    date: dateAgo(Math.floor(index / 2)),
    status: index % 17 === 0 ? 'Refunded' : index % 13 === 0 ? 'Pending' : 'Completed',
  }
})

export const money = (value: number) => `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export const formatDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
export const today = dateAgo(0)
export const daysAgo = dateAgo
