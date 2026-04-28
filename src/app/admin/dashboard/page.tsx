"use client";

import { use } from "react";
import { 
  BarChart3, 
  Package, 
  Users, 
  DollarSign, 
  Plus, 
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Settings,
  MoreVertical,
  Search,
  Download
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
import { Input } from "@/components/ui/input";

export default function AdminDashboard(props: { params: Promise<any> }) {
  const params = use(props.params);
  
  const stats = [
    { title: "Total Revenue", value: "₦12,450,000", change: "+12.5%", icon: DollarSign, color: "text-green-500" },
    { title: "Active Orders", value: "24", change: "+4", icon: CreditCard, color: "text-accent" },
    { title: "Product Listings", value: "156", change: "+12", icon: Package, color: "text-primary" },
    { title: "New Customers", value: "84", change: "+18%", icon: Users, color: "text-accent" },
  ];

  const recentOrders = [
    { id: "ORD-7281", customer: "alex.j@example.com", product: "VPN Access Log", amount: "₦12,500", status: "Delivered", date: "2 mins ago" },
    { id: "ORD-7280", customer: "sarah_tech@protonmail.com", product: "Custom Landing Page", amount: "₦499,000", status: "Processing", date: "15 mins ago" },
    { id: "ORD-7279", customer: "mike88@gmail.com", product: "Aged Social Log", amount: "₦45,000", status: "Delivered", date: "1 hour ago" },
    { id: "ORD-7278", customer: "dev_team@outlook.com", product: "Telegram HQ Link", amount: "₦24,990", status: "Delivered", date: "3 hours ago" },
    { id: "ORD-7277", customer: "crypto_whale@me.com", product: "Whale Alerts Insider", amount: "₦25,000", status: "Delivered", date: "5 hours ago" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight">Command Center</h1>
          <p className="text-muted-foreground mt-1">Real-time marketplace oversight and control.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="border-white/5 bg-white/5">
            <Download className="h-4 w-4 mr-2" />
            Export Data
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
          <Card key={i} className="glass-card border-white/5 hover:border-accent/20 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-headline">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-2">
                <span className="text-green-500 mr-1 flex items-center font-bold">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  {stat.change}
                </span>
                vs last month
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
              <CardTitle className="font-headline text-xl">Recent Transactions</CardTitle>
              <CardDescription>Live stream of marketplace activity.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search orders..." className="pl-9 h-9 w-64 bg-white/5 border-white/10" />
              </div>
              <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="w-[120px] text-xs uppercase font-bold text-muted-foreground">Order ID</TableHead>
                  <TableHead className="text-xs uppercase font-bold text-muted-foreground">Customer</TableHead>
                  <TableHead className="text-xs uppercase font-bold text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-xs uppercase font-bold text-muted-foreground">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell className="font-medium text-xs font-mono">{order.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{order.customer}</span>
                        <span className="text-[10px] text-muted-foreground">{order.product}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={order.status === 'Delivered' 
                          ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                          : 'bg-accent/10 text-accent border-accent/20'}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-headline font-bold text-accent">
                      {order.amount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Analytics Card */}
        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Performance</CardTitle>
            <CardDescription>Category distribution this week.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { label: "Telegram Links", percentage: 85, color: "bg-primary" },
              { label: "Social Logs", percentage: 70, color: "bg-accent" },
              { label: "VPN Access", percentage: 45, color: "bg-primary/60" },
              { label: "Web Dev", percentage: 30, color: "bg-accent/60" },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-accent">{item.percentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-1000`} 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
            
            <div className="pt-6 border-t border-white/5 mt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm font-medium">
                  <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                  Conversion Rate
                </div>
                <span className="font-bold text-green-500">4.8%</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Up 2% from previous 7 days</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
