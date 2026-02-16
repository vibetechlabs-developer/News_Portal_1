# Integration Guide: Careers Admin Panel

## How to Add the Careers Admin Panel to AdminDashboard

### Step 1: Import the AdminCareers Component

At the top of `AdminDashboard.tsx`, add:

```tsx
import AdminCareers from '@/components/careers/AdminCareers';
```

### Step 2: Update TabsList (around line 897)

Change the grid columns from 8 to 9 to accommodate the new tab:

```tsx
// OLD:
<TabsList className="grid w-full max-w-6xl grid-cols-8">

// NEW:
<TabsList className="grid w-full max-w-6xl grid-cols-9">
```

Then add the Careers trigger:

```tsx
<TabsTrigger value="careers" disabled={!isSuperAdmin}>Careers</TabsTrigger>
```

Complete list should be:

```tsx
<TabsList className="grid w-full max-w-6xl grid-cols-9">
  <TabsTrigger value="overview">Overview</TabsTrigger>
  <TabsTrigger value="categories">Categories</TabsTrigger>
  <TabsTrigger value="sections">Sections</TabsTrigger>
  <TabsTrigger value="tags">Tags</TabsTrigger>
  <TabsTrigger value="ads">Ads</TabsTrigger>
  <TabsTrigger value="site">Site</TabsTrigger>
  <TabsTrigger value="analytics">Analytics</TabsTrigger>
  <TabsTrigger value="careers" disabled={!isSuperAdmin}>Careers</TabsTrigger>
  <TabsTrigger value="users" disabled={!isSuperAdmin}>Users</TabsTrigger>
</TabsList>
```

### Step 3: Update onValueChange Handler (around line 881)

Add a condition for the careers tab:

```tsx
if (v === "careers") {
  // Component will load data automatically
}
```

### Step 4: Add Careers TabsContent

Add this tab content before the closing </Tabs> tag:

```tsx
<TabsContent value="careers" className="space-y-4">
  <Card>
    <CardHeader>
      <CardTitle>Careers Management</CardTitle>
      <CardDescription>Add, edit, and manage job postings. Review and approve applications.</CardDescription>
    </CardHeader>
    <CardContent>
      <AdminCareers />
    </CardContent>
  </Card>
</TabsContent>
```

### Step 5: Test

1. Login as Super Admin
2. Navigate to Admin Dashboard
3. Click on "Careers" tab
4. You should see Job Postings and Applications tabs
5. Try creating a job posting
6. Go to `/careers` and submit an application
7. Return to admin and see the application in the list

---

## File Locations for Reference

- **AdminDashboard Component**: `src/pages/AdminDashboard.tsx` (lines ~890-910)
- **AdminCareers Component**: `src/components/careers/AdminCareers.tsx`
- **Careers API**: `src/lib/careersAPI.ts`
- **Careers Page**: `src/pages/Careers.tsx`

---

## That's it! 🎉

The Careers admin panel is now integrated and ready to use!
