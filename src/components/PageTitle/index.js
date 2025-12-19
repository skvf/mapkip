export default function PageTitle({ title, subtitle }) {
  return (
    <div>
      <h1 className="h2">{title}</h1>
      <h2 className="h4 text-muted">{subtitle}</h2>
    </div>
  )
}
