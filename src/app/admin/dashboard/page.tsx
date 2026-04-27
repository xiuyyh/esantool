
"use client";

import { 
  BarChart3, 
  Package, 
  Users, 
  DollarSign, 
  Plus, 
  MoreHorizontal,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const stats = [
    { title: "Total Revenue", value: "$12,450.80", change: "+12.5%", icon: DollarSign, color: "text-green-500" },
    { title: "Active Orders", value: "24", change: "+4", icon: CreditCard, color: "text-accent" },
    { title: "Product Listings", value: "156", change: "+12", icon: Package, color: "text-primary" },
    { title: "New Customers", value: "84", change: "+18%", icon: Users, color: "text-accent" },
  ];

  const recentOrders = [
    { id: "ORD-7281", customer: "alex.j@example.com", product: "VPN Access Log", amount: "$12.50", status: "Delivered", date: "2 mins ago" },
    { id: "ORD-7280", customer: "sarah_tech@protonmail.com", product: "Custom Landing Page", amount: "$499.00", status: "Processing", date: "15 mins ago" },
    { id: "ORD-7279", customer: "mike88@gmail.com", product: "Aged Social Log", amount: "$45.00", status: "Delivered", date: "1 hour ago" },
    { id: "ORD-7278", customer: "dev_team@outlook.com", product: "Telegram HQ Link", amount: "$24.99", status: "Delivered", date: "3 hours ago" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold">Admin Command Center</h1>
          <p className="text-muted-foreground">Manage your marketplace operations and track growth.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-white/10">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            New Listing
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="glass-card border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-headline">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <span className="text-green-500 mr-1 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  {stat.change}
                </span>
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <Card className="lg:col-span-2 glass-card border-white/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline">Recent Sales</CardTitle>
              <CardDescription>Live stream of marketplace transactions.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-accent">View All</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5">
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id} className="border-white/5">
                    <TableCell className="font-medium text-xs">{order.id}</TableCell>
                    <TableCell className="text-xs">{order.customer}</TableCell>
                    <TableCell className="text-xs font-semibold">{order.product}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={order.status === 'Delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-headline text-accent">{order.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Analytics Card */}
        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="font-headline">Market Trends</CardTitle>
            <CardDescription>Top performing categories this week.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { label: "Telegram Links", percentage: 85, color: "bg-accent" },
              { label: "Social Logs", percentage: 70, color: "bg-primary" },
              { label: "VPN Access", percentage: 45, color: "bg-accent" },
              { label: "Web Dev", percentage: 30, color: "bg-primary" },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-muted-foreground">{item.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-1000`} 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t border-white/5 mt-6">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-muted-foreground">
                  <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                  Growth Rate
                </div>
                <span className="font-bold text-green-500">+4.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
