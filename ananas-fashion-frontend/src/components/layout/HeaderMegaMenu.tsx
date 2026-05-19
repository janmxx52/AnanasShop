import { Link, NavLink } from 'react-router-dom'

export type HeaderMegaMenuImageItem = {
  title: string
  to: string
  image: string
}

export type HeaderMegaMenuColumn = {
  title: string
  links: Array<{
    label: string
    to: string
  }>
}

type HeaderMegaMenuProps = {
  label: string
  to: string
  imageItems?: HeaderMegaMenuImageItem[]
  columns?: HeaderMegaMenuColumn[]
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `ananas-main-nav-link ${isActive ? 'text-[#f15a24]' : 'text-neutral-900'}`

function hasImageMenu(items?: HeaderMegaMenuImageItem[]): items is HeaderMegaMenuImageItem[] {
  return Array.isArray(items) && items.length > 0
}

function hasColumnsMenu(columns?: HeaderMegaMenuColumn[]): columns is HeaderMegaMenuColumn[] {
  return Array.isArray(columns) && columns.length > 0
}

export function HeaderMegaMenu({ label, to, imageItems, columns }: HeaderMegaMenuProps) {
  const hasDropdown = hasImageMenu(imageItems) || hasColumnsMenu(columns)

  return (
    <div className="group relative">
      <NavLink to={to} className={navLinkClass}>
        {label}
      </NavLink>

      {hasDropdown ? (
        <div className="pointer-events-none invisible absolute left-1/2 top-full z-40 w-[920px] -translate-x-1/2 translate-y-1 border border-neutral-200 bg-white p-6 opacity-0 shadow-2xl transition duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
          {hasImageMenu(imageItems) ? (
            <div className="grid grid-cols-4 gap-4">
              {imageItems.map((item) => (
                <Link key={item.title} to={item.to} className="group/card block">
                  <div className="overflow-hidden bg-neutral-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-36 w-full object-cover transition duration-500 group-hover/card:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <p className="mt-2 text-xs font-semibold tracking-[0.14em] text-neutral-900 uppercase group-hover/card:text-[#f15a24]">
                    {item.title}
                  </p>
                </Link>
              ))}
            </div>
          ) : null}

          {hasColumnsMenu(columns) ? (
            <div className="grid grid-cols-3 gap-8">
              {columns.map((column) => (
                <section key={column.title} className="space-y-2">
                  <h3 className="border-b border-neutral-200 pb-2 text-xs font-bold tracking-[0.14em] text-neutral-900 uppercase">
                    {column.title}
                  </h3>
                  <ul className="space-y-1.5">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <Link to={link.to} className="text-sm text-neutral-700 transition hover:text-[#f15a24]">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
