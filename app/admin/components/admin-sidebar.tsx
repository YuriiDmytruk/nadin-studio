'use client'

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar'
import { Package, Plus } from 'lucide-react'

interface AdminSidebarProps {
    activeView: 'list' | 'add'
    onViewChange: (view: 'list' | 'add') => void
}

export function AdminSidebar({ activeView, onViewChange }: AdminSidebarProps) {
    return (
        <Sidebar variant="inset">
            <SidebarHeader>
                <div className="px-2 py-4">
                    <h2 className="text-lg font-semibold">Nadin Studio</h2>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Management</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={() => onViewChange('list')}
                                    isActive={activeView === 'list'}
                                >
                                    <Package className="size-4" />
                                    <span>List of Products</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={() => onViewChange('add')}
                                    isActive={activeView === 'add'}
                                >
                                    <Plus className="size-4" />
                                    <span>Add New Product</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}

