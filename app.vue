// app.vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Simple auth check for protected routes
const user = useSupabaseUser();
const router = useRouter();

watch(user, (newUser) => {
  if (!newUser && router.currentRoute.value.path !== '/login') {
    router.push('/login');
  }
});
</script>