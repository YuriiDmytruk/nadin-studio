'use client'

import { useState } from 'react'
import { logout } from '@/lib/services/auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { AdminSidebar } from './components/admin-sidebar'
import ProductList from './components/product-list'
import AddProduct from './components/add-product'
import EditProduct from './components/edit-product'
import { Product } from '@/types/product'
import { fetchProductById } from './actions/products'

export default function AdminPage() {
  const router = useRouter()
  const [activeView, setActiveView] = useState<'list' | 'add' | 'edit'>('list')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const handleLogout = async () => {
    const result = await logout()
    if (result.success) {
      router.push('/login')
      router.refresh()
    }
  }

  const handleEdit = async (productId: number) => {
    const product = await fetchProductById(productId)
    if (product) {
      setEditingProduct(product)
      setActiveView('edit')
    }
  }

  const handleCancelEdit = () => {
    setEditingProduct(null)
    setActiveView('list')
  }

  const handleViewChange = (view: 'list' | 'add') => {
    setActiveView(view)
    setEditingProduct(null)
  }

  return (
    <SidebarProvider>
      <AdminSidebar activeView={activeView === 'edit' ? 'list' : activeView} onViewChange={handleViewChange} />
      <SidebarInset >
        <header className="flex h-16 shrink-0 items-center gap-2 border-gray-200! border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {activeView === 'list' && <ProductList onEdit={handleEdit} />}
          {activeView === 'add' && <AddProduct />}
          {activeView === 'edit' && editingProduct && (
            <EditProduct product={editingProduct} onCancel={handleCancelEdit} />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
