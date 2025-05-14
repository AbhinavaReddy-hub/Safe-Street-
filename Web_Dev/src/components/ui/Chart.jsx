
import { TrendingUp } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


const chartData = [
  { city: "Hyderabad", reports: 120 },
  { city: "Delhi", reports: 98 },
  { city: "Mumbai", reports: 140 },
  { city: "Chennai", reports: 80 },
  { city: "Bangalore", reports: 160 },
  { city: "Kolkata", reports: 110 },
]

export default function CityReportsChart() {

    const primaryHSL = getComputedStyle(document.documentElement)
  .getPropertyValue('--primary')
  .trim();
  return (
    <Card className="w-full max-w-4xl mx-auto border-none">
      <CardHeader>
        <CardTitle>City-wise Reports</CardTitle>
        <CardDescription>Damage reports across major Indian cities</CardDescription>
      </CardHeader>

      <CardContent className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="city" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="reports" fill="oklch(47.3% 0.137 46.201/0.8)" radius={[6, 6, 6, 6]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up in Bangalore <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Based on road damage data submitted in 2024
        </div>
      </CardFooter>
    </Card>
  )
}
