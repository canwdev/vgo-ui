# Foldable Sidebar

<script lang="ts" setup>
import FoldableSidebarLayout from '../../../src/components/Layouts/FoldableSidebarLayout.vue' 
import {ref} from 'vue' 

const isSidebarOpen = ref(true)
</script>

<div>isSidebarOpen:{{isSidebarOpen}}</div>
<FoldableSidebarLayout v-model:expand="isSidebarOpen">
    <template #sidebar>
        Sidebar content
    </template>
    <div>
      Main content
    </div>
</FoldableSidebarLayout>