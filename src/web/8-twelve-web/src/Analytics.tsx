import { useMemo, useState } from 'react'
import { daysAgo, formatDate, money, today, transactions } from './mockData'
import { Empty } from './ui'

type Period = 'Daily' | 'Weekly' | 'Monthly'

export function Analytics({ dashboard = false }: { dashboard?: boolean }) {
  const [period, setPeriod] = useState<Period>('Daily')
  const [from, setFrom] = useState(daysAgo(29))
  const [to, setTo] = useState(today)
  const completed = useMemo(() => transactions.filter(item => item.status === 'Completed' && (!from || item.date >= from) && (!to || item.date <= to)), [from, to])
  const chart = useMemo(() => {
    const groups = new Map<string, number>()
    completed.forEach(item => {
      const date = new Date(`${item.date}T12:00:00`)
      let key = item.date
      if (period === 'Monthly') key = item.date.slice(0, 7)
      if (period === 'Weekly') {
        date.setDate(date.getDate() - ((date.getDay() + 6) % 7))
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      }
      groups.set(key, (groups.get(key) ?? 0) + item.amount)
    })
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [completed, period])
  const methods = ['GCash', 'Cash', 'Maya', 'Card'].map(name => ({ name, count: completed.filter(item => item.payment === name).length }))
  const products = ['Coca-Cola Original', 'Chippy', 'Bottled Water', 'Pancit Canton', 'Cloud 9 Chocolate', 'Nescafé', 'Gardenia Classic Bread', 'Century Tuna'].map(name => ({ name, count: completed.filter(item => item.items.includes(name)).length })).sort((a, b) => b.count - a.count)
  const categories = [
    { name: 'Beverages', count: products.filter(product => ['Coca-Cola Original', 'Bottled Water', 'Nescafé'].includes(product.name)).reduce((sum, product) => sum + product.count, 0) },
    { name: 'Snacks', count: products.filter(product => ['Chippy', 'Cloud 9 Chocolate'].includes(product.name)).reduce((sum, product) => sum + product.count, 0) },
    { name: 'Essentials', count: products.filter(product => ['Gardenia Classic Bread', 'Century Tuna'].includes(product.name)).reduce((sum, product) => sum + product.count, 0) },
    { name: 'Instant Food', count: products.find(product => product.name === 'Pancit Canton')?.count ?? 0 },
  ]
  const max = Math.max(...chart.map(([, value]) => value), 1)
  const colors = ['#d12e19', '#efaa25', '#4b8e73', '#8ba3c7']
  return <div className="analytics">
    <div className="analytics-toolbar"><div className="period-tabs" aria-label="Chart period">{(['Daily', 'Weekly', 'Monthly'] as const).map(item => <button key={item} className={period === item ? 'selected' : ''} aria-pressed={period === item} onClick={() => setPeriod(item)}>{item}</button>)}</div><div className="date-range"><label>From <input type="date" aria-label="Analytics start date" value={from} max={to} onChange={event => setFrom(event.target.value)} /></label><label>To <input type="date" aria-label="Analytics end date" value={to} min={from} onChange={event => setTo(event.target.value)} /></label></div></div>
    <div className={`analytics-grid ${dashboard ? 'dashboard-analytics' : ''}`}>
      <section className="panel chart-panel"><div className="panel-heading"><div><h2>{period === 'Monthly' ? 'Monthly revenue' : `${period} sales overview`}</h2><p>Completed sales for the selected date range</p></div><span className="chart-total">{money(completed.reduce((sum, item) => sum + item.amount, 0))}</span></div>
        {chart.length ? <div className="bar-chart" role="img" aria-label={`${period} sales chart. ${chart.map(([date, value]) => `${date}: ${money(value)}`).join(', ')}`}><div className="chart-grid"><span>{money(max)}</span><span>{money(max / 2)}</span><span>₱0</span></div><div className="bars">{chart.map(([date, value]) => <div className="bar-column" key={date} title={`${date}: ${money(value)}`}><div className="bar" style={{ height: `${Math.max(value / max * 100, 2)}%` }} /><span>{period === 'Monthly' ? date.slice(5) : date.slice(5).replace('-', '/')}</span></div>)}</div></div> : <Empty text="No completed sales in this date range." />}
        <div className="chart-caption"><span><i /> Sales revenue</span><span>{from ? formatDate(from) : 'Any date'} – {to ? formatDate(to) : 'Any date'}</span></div>
      </section>
      <section className="panel breakdown-panel"><div className="panel-heading"><div><h2>Payment methods</h2><p>Distribution of completed sales</p></div><span className="mini-icon">◉</span></div>{completed.length ? <><div className="donut-wrap"><div className="donut" style={{ background: `conic-gradient(${methods.map((_, index) => `${colors[index]} ${methods.slice(0, index).reduce((sum, current) => sum + current.count, 0) / completed.length * 100}% ${methods.slice(0, index + 1).reduce((sum, current) => sum + current.count, 0) / completed.length * 100}%`).join(', ')})` }}><div><strong>{completed.length}</strong><span>transactions</span></div></div></div><div className="legend">{methods.map((method, index) => <div key={method.name}><span><i style={{ background: colors[index] }} />{method.name}</span><b>{Math.round(method.count / completed.length * 100)}%</b></div>)}</div></> : <Empty text="No payment data in this date range." />}</section>
      {!dashboard && <><section className="panel"><div className="panel-heading"><div><h2>Best-selling products</h2><p>By items purchased</p></div></div><div className="rank-list">{products.slice(0, 5).map((product, index) => <div key={product.name}><span className="rank-number">{String(index + 1).padStart(2, '0')}</span><strong>{product.name}</strong><span>{product.count} sold</span></div>)}</div></section><section className="panel"><div className="panel-heading"><div><h2>Sales by category</h2><p>Items sold in each category</p></div></div><div className="category-list">{categories.map((category, index) => <div key={category.name}><div><strong>{category.name}</strong><span>{category.count} items</span></div><div className="progress-track"><span style={{ width: `${category.count / Math.max(...categories.map(item => item.count), 1) * 100}%`, background: colors[index] }} /></div></div>)}</div></section></>}
    </div>
  </div>
}
