import { useMemo, useState } from 'react'
import { formatDate, money, transactions, type Transaction } from './mockData'
import { Badge, Empty, Modal, Search } from './ui'

export function TransactionTable({ compact = false, customerId }: { compact?: boolean; customerId?: number }) {
  const [query, setQuery] = useState('')
  const [payment, setPayment] = useState('All')
  const [status, setStatus] = useState('All')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sort, setSort] = useState<keyof Transaction>('date')
  const [ascending, setAscending] = useState(false)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Transaction | null>(null)
  const filtered = useMemo(() => transactions.filter(item =>
    (!customerId || item.userId === customerId) &&
    `${item.id} ${item.customer}`.toLowerCase().includes(query.toLowerCase()) &&
    (payment === 'All' || item.payment === payment) &&
    (status === 'All' || item.status === status) &&
    (!from || item.date >= from) && (!to || item.date <= to)
  ).sort((a, b) => String(a[sort]).localeCompare(String(b[sort]), undefined, { numeric: true }) * (ascending ? 1 : -1)), [query, payment, status, from, to, sort, ascending, customerId])
  const pageSize = compact ? 5 : 8
  const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, maxPage)
  const changeSort = (column: keyof Transaction) => {
    if (sort === column) setAscending(!ascending)
    else { setSort(column); setAscending(true) }
    setPage(1)
  }
  const heading = (label: string, column: keyof Transaction) => <button className="sort-button" onClick={() => changeSort(column)}>{label} <span>{sort === column ? ascending ? '↑' : '↓' : '↕'}</span></button>
  return <>
    {!customerId && <div className="table-tools"><Search value={query} onChange={value => { setQuery(value); setPage(1) }} placeholder="Search ID or customer..." /><select aria-label="Filter by payment method" value={payment} onChange={event => { setPayment(event.target.value); setPage(1) }}><option value="All">All payments</option><option>Cash</option><option>GCash</option><option>Maya</option><option>Card</option></select><select aria-label="Filter by transaction status" value={status} onChange={event => { setStatus(event.target.value); setPage(1) }}><option value="All">All statuses</option><option>Completed</option><option>Pending</option><option>Refunded</option></select>{!compact && <><label className="date-filter">From <input aria-label="Transactions from date" type="date" value={from} max={to || undefined} onChange={event => { setFrom(event.target.value); setPage(1) }} /></label><label className="date-filter">To <input aria-label="Transactions to date" type="date" value={to} min={from || undefined} onChange={event => { setTo(event.target.value); setPage(1) }} /></label></>}</div>}
    <div className="table-scroll"><table><thead><tr><th>{heading('Transaction ID', 'id')}</th><th>{heading('Customer', 'customer')}</th><th>{heading('Items purchased', 'items')}</th><th>{heading('Amount', 'amount')}</th><th>{heading('Payment', 'payment')}</th><th>{heading('Date', 'date')}</th><th>{heading('Status', 'status')}</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
      {filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(item => <tr key={item.id}><td>{customerId ? item.id : <button className="table-link" onClick={() => setSelected(item)}>{item.id}</button>}</td><td className="strong-cell">{item.customer}</td><td>{item.items}</td><td className="strong-cell">{money(item.amount)}</td><td>{item.payment}</td><td>{formatDate(item.date)}</td><td><Badge tone={item.status === 'Completed' ? 'green' : item.status === 'Pending' ? 'amber' : 'gray'}>{item.status}</Badge></td><td>{!customerId && <button className="row-action" onClick={() => setSelected(item)}>View</button>}</td></tr>)}
    </tbody></table></div>
    {!filtered.length && <Empty text="Try changing your search or filters." />}
    <div className="table-footer"><span>Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} transactions</span><div><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button><span> {currentPage} / {maxPage} </span><button disabled={currentPage === maxPage} onClick={() => setPage(currentPage + 1)}>Next</button></div></div>
    {selected && <Modal title="Transaction details" onClose={() => setSelected(null)}><div className="detail-list"><div><span>Transaction ID</span><strong>{selected.id}</strong></div><div><span>Customer</span><strong>{selected.customer}</strong></div><div><span>Items purchased</span><strong>{selected.items}</strong></div><div><span>Total amount</span><strong>{money(selected.amount)}</strong></div><div><span>Payment method</span><strong>{selected.payment}</strong></div><div><span>Transaction date</span><strong>{formatDate(selected.date)}</strong></div><div><span>Status</span><Badge tone={selected.status === 'Completed' ? 'green' : selected.status === 'Pending' ? 'amber' : 'gray'}>{selected.status}</Badge></div></div><div className="modal-actions"><button className="secondary-button" onClick={() => setSelected(null)}>Close</button></div></Modal>}
  </>
}
