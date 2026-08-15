<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue'
import { dashboardApiFetch } from '../services/api'
import {
  Layers,
  Plus,
  Trash2,
  Edit3,
  Search,
  X,
  Check,
  FolderPlus,
} from 'lucide-vue-next'

const isDark = inject('isDark', ref(true))

interface SkillCategory {
  id: string
  name: string
  slug: string
  _count?: { skills: number }
}

interface Skill {
  id: string
  categoryId: string
  name: string
  slug: string
  description: string | null
  category: { id: string; name: string; slug: string }
}

const categories = ref<SkillCategory[]>([])
const skills = ref<Skill[]>([])
const selectedCategoryFilter = ref('')
const searchQuery = ref('')
const loading = ref(true)
const actionMessage = ref<string | null>(null)

// Modal states
const showCategoryModal = ref(false)
const categoryModalMode = ref<'create' | 'edit'>('create')
const editingCategoryId = ref<string | null>(null)
const categoryForm = ref({ name: '', slug: '' })

const showSkillModal = ref(false)
const skillModalMode = ref<'create' | 'edit'>('create')
const editingSkillId = ref<string | null>(null)
const skillForm = ref({ categoryId: '', name: '', slug: '', description: '' })

const loadData = async () => {
  loading.value = true
  try {
    const catRes = await dashboardApiFetch<{ categories: SkillCategory[] }>('/skills/categories')
    categories.value = catRes.categories

    const skillRes = await dashboardApiFetch<{ skills: Skill[] }>('/skills')
    skills.value = skillRes.skills
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

const filteredSkills = computed(() => {
  return skills.value.filter((s) => {
    const matchesCat = !selectedCategoryFilter.value || s.categoryId === selectedCategoryFilter.value
    const matchesQuery =
      !searchQuery.value ||
      s.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesCat && matchesQuery
  })
})

const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

// Category CRUD Actions
const openCreateCategory = () => {
  categoryModalMode.value = 'create'
  editingCategoryId.value = null
  categoryForm.value = { name: '', slug: '' }
  showCategoryModal.value = true
}

const openEditCategory = (cat: SkillCategory) => {
  categoryModalMode.value = 'edit'
  editingCategoryId.value = cat.id
  categoryForm.value = { name: cat.name, slug: cat.slug }
  showCategoryModal.value = true
}

const saveCategory = async () => {
  try {
    actionMessage.value = null
    if (categoryModalMode.value === 'create') {
      await dashboardApiFetch('/skills/categories', {
        method: 'POST',
        body: JSON.stringify(categoryForm.value),
      })
      actionMessage.value = 'Category created successfully!'
    } else if (editingCategoryId.value) {
      await dashboardApiFetch(`/skills/categories/${editingCategoryId.value}`, {
        method: 'PATCH',
        body: JSON.stringify(categoryForm.value),
      })
      actionMessage.value = 'Category updated successfully!'
    }
    showCategoryModal.value = false
    await loadData()
  } catch (err: unknown) {
    alert(err instanceof Error ? err.message : 'Category operation failed')
  }
}

const deleteCategory = async (id: string) => {
  if (!confirm('Are you sure you want to delete this category?')) return
  try {
    await dashboardApiFetch(`/skills/categories/${id}`, { method: 'DELETE' })
    actionMessage.value = 'Category deleted successfully!'
    await loadData()
  } catch (err: unknown) {
    alert(err instanceof Error ? err.message : 'Cannot delete category with associated skills')
  }
}

// Skill CRUD Actions
const openCreateSkill = () => {
  skillModalMode.value = 'create'
  editingSkillId.value = null
  skillForm.value = {
    categoryId: categories.value[0]?.id || '',
    name: '',
    slug: '',
    description: '',
  }
  showSkillModal.value = true
}

const openEditSkill = (s: Skill) => {
  skillModalMode.value = 'edit'
  editingSkillId.value = s.id
  skillForm.value = {
    categoryId: s.categoryId,
    name: s.name,
    slug: s.slug,
    description: s.description || '',
  }
  showSkillModal.value = true
}

const saveSkill = async () => {
  try {
    actionMessage.value = null
    if (skillModalMode.value === 'create') {
      await dashboardApiFetch('/skills', {
        method: 'POST',
        body: JSON.stringify(skillForm.value),
      })
      actionMessage.value = 'Skill created successfully!'
    } else if (editingSkillId.value) {
      await dashboardApiFetch(`/skills/${editingSkillId.value}`, {
        method: 'PATCH',
        body: JSON.stringify(skillForm.value),
      })
      actionMessage.value = 'Skill updated successfully!'
    }
    showSkillModal.value = false
    await loadData()
  } catch (err: unknown) {
    alert(err instanceof Error ? err.message : 'Skill operation failed')
  }
}

const deleteSkill = async (id: string) => {
  if (!confirm('Are you sure you want to delete this skill?')) return
  try {
    await dashboardApiFetch(`/skills/${id}`, { method: 'DELETE' })
    actionMessage.value = 'Skill deleted successfully!'
    await loadData()
  } catch (err: unknown) {
    alert(err instanceof Error ? err.message : 'Failed to delete skill')
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 :class="isDark ? 'text-white' : 'text-gray-900'" class="text-2xl font-extrabold tracking-tight">Skill & Category Taxonomy</h1>
        <p :class="isDark ? 'text-gray-400' : 'text-gray-500'" class="text-xs mt-1">
          Real database CRUD operations for global skill categories across all worldwide disciplines.
        </p>
      </div>

      <div class="flex gap-2">
        <button
          @click="openCreateCategory"
          :class="isDark ? 'bg-[#181A1F] border-[#252830] text-gray-200 hover:border-[#FF7A30]/50' : 'bg-white border-gray-200 text-gray-700 hover:border-[#FF7A30]'"
          class="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold hover:text-[#FF7A30] transition"
        >
          <FolderPlus class="w-4 h-4 text-[#FF7A30]" />
          <span>+ Category</span>
        </button>

        <button
          @click="openCreateSkill"
          class="flex items-center gap-2 px-4 py-2 rounded-xl brand-gradient text-white text-xs font-bold shadow-md hover:opacity-95 transition"
        >
          <Plus class="w-4 h-4" />
          <span>+ Add Skill</span>
        </button>
      </div>
    </div>

    <div v-if="actionMessage" class="p-3 text-xs text-[#FF7A30] bg-[#FF7A30]/10 rounded-xl border border-[#FF7A30]/30 flex items-center gap-2">
      <Check class="w-4 h-4" />
      <span>{{ actionMessage }}</span>
    </div>

    <!-- Category Pills Section -->
    <div
      :class="isDark ? 'bg-[#181A1F] border-[#252830]' : 'bg-white border-gray-200'"
      class="p-5 rounded-2xl border space-y-3 transition-colors"
    >
      <div class="flex items-center justify-between">
        <span :class="isDark ? 'text-gray-400' : 'text-gray-500'" class="text-xs font-bold uppercase tracking-wider">
          Database Categories ({{ categories.length }})
        </span>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          @click="selectedCategoryFilter = ''"
          class="px-3.5 py-1.5 rounded-full text-xs font-semibold transition"
          :class="!selectedCategoryFilter ? 'brand-gradient text-white font-bold shadow-xs' : (isDark ? 'bg-[#121316] border-[#252830] text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-700')"
        >
          All Categories ({{ skills.length }})
        </button>

        <div
          v-for="cat in categories"
          :key="cat.id"
          class="group relative flex items-center rounded-full border transition"
          :class="selectedCategoryFilter === cat.id ? 'bg-[#FF7A30]/15 border-[#FF7A30] text-[#FF7A30]' : (isDark ? 'bg-[#121316] border-[#252830] text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-700')"
        >
          <button
            @click="selectedCategoryFilter = cat.id"
            class="px-3 py-1.5 text-xs font-semibold"
          >
            {{ cat.name }}
          </button>

          <div class="hidden group-hover:flex items-center gap-1 pr-2">
            <button @click.stop="openEditCategory(cat)" class="text-gray-400 hover:text-[#FF7A30]">
              <Edit3 class="w-3 h-3" />
            </button>
            <button @click.stop="deleteCategory(cat.id)" class="text-gray-400 hover:text-red-400">
              <Trash2 class="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Skill Filter & Search Toolbar -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="relative w-full sm:w-72">
        <Search class="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search skills by name or slug..."
          :class="isDark ? 'bg-[#181A1F] border-[#252830] text-gray-200 focus:border-[#FF7A30]' : 'bg-white border-gray-200 text-gray-800 focus:border-[#FF7A30]'"
          class="w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs focus:outline-hidden"
        />
      </div>

      <span :class="isDark ? 'text-gray-400' : 'text-gray-500'" class="text-xs">
        Showing <strong :class="isDark ? 'text-white' : 'text-gray-900'">{{ filteredSkills.length }}</strong> skills
      </span>
    </div>

    <!-- Skills Cards Grid -->
    <div v-if="loading" class="text-xs text-gray-500 text-center py-12">Loading taxonomy catalog...</div>

    <div v-else-if="filteredSkills.length === 0" :class="isDark ? 'bg-[#181A1F] border-[#252830] text-gray-400' : 'bg-white border-gray-200 text-gray-500'" class="p-8 rounded-2xl border text-center text-xs">
      No skills found matching filter. Click "+ Add Skill" to create one.
    </div>

    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="s in filteredSkills"
        :key="s.id"
        :class="isDark ? 'bg-[#181A1F] border-[#252830] hover:border-[#FF7A30]/40' : 'bg-white border-gray-200 hover:border-[#FF7A30]/50'"
        class="p-5 rounded-2xl border transition shadow-xs space-y-3 flex flex-col justify-between"
      >
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase text-[#FF7A30] bg-[#FF7A30]/10 border border-[#FF7A30]/20 px-2.5 py-0.5 rounded-full">
              {{ s.category.name }}
            </span>

            <div class="flex items-center gap-1.5">
              <button @click="openEditSkill(s)" :class="isDark ? 'hover:bg-[#121316]' : 'hover:bg-gray-100'" class="p-1 rounded-md text-gray-400 hover:text-[#FF7A30] transition">
                <Edit3 class="w-3.5 h-3.5" />
              </button>
              <button @click="deleteSkill(s.id)" :class="isDark ? 'hover:bg-[#121316]' : 'hover:bg-gray-100'" class="p-1 rounded-md text-gray-400 hover:text-red-400 transition">
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <h3 :class="isDark ? 'text-white' : 'text-gray-900'" class="font-bold text-base leading-snug">{{ s.name }}</h3>
          <p v-if="s.description" :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="text-xs leading-relaxed">{{ s.description }}</p>
        </div>

        <div :class="isDark ? 'border-[#252830]' : 'border-gray-100'" class="pt-2 border-t text-[10px] font-mono text-gray-500 flex justify-between">
          <span>slug: {{ s.slug }}</span>
        </div>
      </div>
    </div>

    <!-- Category Modal -->
    <div v-if="showCategoryModal" class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div :class="isDark ? 'bg-[#181A1F] border-[#252830]' : 'bg-white border-gray-200'" class="border w-full max-w-md p-6 rounded-2xl shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <h3 :class="isDark ? 'text-white' : 'text-gray-900'" class="text-base font-bold">
            {{ categoryModalMode === 'create' ? 'Add New Category' : 'Edit Category' }}
          </h3>
          <button @click="showCategoryModal = false" class="text-gray-400 hover:text-gray-200"><X class="w-4 h-4" /></button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label :class="isDark ? 'text-gray-300' : 'text-gray-700'" class="block font-semibold mb-1">Category Name</label>
            <input
              v-model="categoryForm.name"
              @input="categoryForm.slug = generateSlug(categoryForm.name)"
              type="text"
              placeholder="e.g. Engineering & Robotics"
              :class="isDark ? 'bg-[#121316] border-[#252830] text-white focus:border-[#FF7A30]' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#FF7A30]'"
              class="w-full p-2.5 border rounded-xl focus:outline-hidden"
            />
          </div>
          <div>
            <label :class="isDark ? 'text-gray-300' : 'text-gray-700'" class="block font-semibold mb-1">Slug</label>
            <input
              v-model="categoryForm.slug"
              type="text"
              placeholder="engineering"
              :class="isDark ? 'bg-[#121316] border-[#252830] text-white focus:border-[#FF7A30]' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#FF7A30]'"
              class="w-full p-2.5 border rounded-xl font-mono focus:outline-hidden"
            />
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button @click="showCategoryModal = false" :class="isDark ? 'bg-[#121316] text-gray-400' : 'bg-gray-100 text-gray-600'" class="px-4 py-2 rounded-xl text-xs font-semibold">Cancel</button>
          <button @click="saveCategory" class="px-4 py-2 rounded-xl brand-gradient text-white text-xs font-bold shadow-xs">Save Category</button>
        </div>
      </div>
    </div>

    <!-- Skill Modal -->
    <div v-if="showSkillModal" class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div :class="isDark ? 'bg-[#181A1F] border-[#252830]' : 'bg-white border-gray-200'" class="border w-full max-w-md p-6 rounded-2xl shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <h3 :class="isDark ? 'text-white' : 'text-gray-900'" class="text-base font-bold">
            {{ skillModalMode === 'create' ? 'Add New Skill' : 'Edit Skill' }}
          </h3>
          <button @click="showSkillModal = false" class="text-gray-400 hover:text-gray-200"><X class="w-4 h-4" /></button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label :class="isDark ? 'text-gray-300' : 'text-gray-700'" class="block font-semibold mb-1">Category</label>
            <select
              v-model="skillForm.categoryId"
              :class="isDark ? 'bg-[#121316] border-[#252830] text-white focus:border-[#FF7A30]' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#FF7A30]'"
              class="w-full p-2.5 border rounded-xl focus:outline-hidden"
            >
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>

          <div>
            <label :class="isDark ? 'text-gray-300' : 'text-gray-700'" class="block font-semibold mb-1">Skill Name</label>
            <input
              v-model="skillForm.name"
              @input="skillForm.slug = generateSlug(skillForm.name)"
              type="text"
              placeholder="e.g. Quantum Mechanics"
              :class="isDark ? 'bg-[#121316] border-[#252830] text-white focus:border-[#FF7A30]' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#FF7A30]'"
              class="w-full p-2.5 border rounded-xl focus:outline-hidden"
            />
          </div>

          <div>
            <label :class="isDark ? 'text-gray-300' : 'text-gray-700'" class="block font-semibold mb-1">Slug</label>
            <input
              v-model="skillForm.slug"
              type="text"
              placeholder="quantum-mechanics"
              :class="isDark ? 'bg-[#121316] border-[#252830] text-white focus:border-[#FF7A30]' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#FF7A30]'"
              class="w-full p-2.5 border rounded-xl font-mono focus:outline-hidden"
            />
          </div>

          <div>
            <label :class="isDark ? 'text-gray-300' : 'text-gray-700'" class="block font-semibold mb-1">Description</label>
            <textarea
              v-model="skillForm.description"
              rows="2"
              placeholder="Brief summary of skill domain..."
              :class="isDark ? 'bg-[#121316] border-[#252830] text-white focus:border-[#FF7A30]' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#FF7A30]'"
              class="w-full p-2.5 border rounded-xl focus:outline-hidden"
            />
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button @click="showSkillModal = false" :class="isDark ? 'bg-[#121316] text-gray-400' : 'bg-gray-100 text-gray-600'" class="px-4 py-2 rounded-xl text-xs font-semibold">Cancel</button>
          <button @click="saveSkill" class="px-4 py-2 rounded-xl brand-gradient text-white text-xs font-bold shadow-xs">Save Skill</button>
        </div>
      </div>
    </div>
  </div>
</template>
