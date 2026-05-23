const TAG = {
  vip:     { label: "VIP",        cls: "bg-purple-100 text-purple-800" },
  regular: { label: "Постоянный", cls: "bg-blue-100 text-blue-800"    },
  new:     { label: "Новый",      cls: "bg-green-100 text-green-800"  },
}

const STATUS_BADGE = {
  pending:   "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  arrived:   "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  no_show:   "bg-zinc-100 text-zinc-500",
  cancelled: "bg-red-100 text-red-700",
}
const STATUS_LABEL = {
  pending: "Ожидает", confirmed: "Подтв.", arrived: "Пришёл",
  completed: "Заверш.", no_show: "Не пришёл", cancelled: "Отменена",
}
