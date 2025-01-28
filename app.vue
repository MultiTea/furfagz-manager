<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const user = useSupabaseUser();
const router = useRouter();

watch(user, (newUser) => {
  if (!newUser && router.currentRoute.value.path !== '/login') {
    router.push('/login');
  } else if (newUser && router.currentRoute.value.path === '/login') {
    router.push('/');
  }
});
</script>