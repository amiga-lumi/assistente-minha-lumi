'use client'

import { useState, useEffect } from 'react'
import { Heart, Calendar, Utensils, Sparkles, Clock, Star, Crown, ArrowLeft, Plus, Trash2, User, Mail, Lock, Eye, EyeOff, Music, ShoppingCart, Activity, X, Settings, Bell, BellOff } from 'lucide-react'

type Screen = 'login' | 'home' | 'planner' | 'mood' | 'food' | 'memory' | 'premium' | 'cycle' | 'shopping' | 'notifications'
type UserType = 'free' | 'premium'
type MealPeriod = 'cafe-da-manha' | 'lanche-matinal' | 'almoco' | 'lanche-tarde' | 'jantar' | 'lanche-noite' | 'bebidas'
type LoginStep = 'name' | 'email' | 'password' | 'welcome'
type CycleStatus = 'menstruation' | 'ovulation' | 'pms'
type FlowIntensity = 'leve' | 'medio' | 'intenso'

interface Task {
  id: number
  text: string
  completed: boolean
}

interface MoodEntry {
  date: string
  mood: string
  emoji: string
  note?: string
}

interface Recipe {
  title: string
  ingredients: string[]
  instructions: string[]
}

interface User {
  name: string
  email: string
  password?: string
  isPremium: boolean
}

interface CycleData {
  cycleDuration: number
  flowDuration: number
  flowIntensity: 'leve' | 'moderado' | 'intenso'
  lastPeriodStart?: string
  lastPeriodEnd?: string
  isOvulating?: boolean
  isPMS?: boolean
  menstruationDays: { [key: string]: FlowIntensity }
  ovulationDays: string[]
  pmsDays: string[]
}

interface ShoppingItem {
  id: number
  text: string
  completed: boolean
}

interface DayStatus {
  menstruation?: FlowIntensity
  ovulation?: boolean
  pms?: boolean
}

interface NotificationSettings {
  shopping: boolean
  cycle: boolean
  mood: boolean
  food: boolean
}

export default function LumiApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login')
  const [loginStep, setLoginStep] = useState<LoginStep>('name')
  const [userType, setUserType] = useState<UserType>('free')
  const [user, setUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loginForm, setLoginForm] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [selectedMood, setSelectedMood] = useState('')
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([])
  const [moodNote, setMoodNote] = useState('')
  const [foodInput, setFoodInput] = useState('')
  const [selectedMealPeriod, setSelectedMealPeriod] = useState<MealPeriod>('almoco')
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null)
  const [cycleData, setCycleData] = useState<CycleData>({
    cycleDuration: 28,
    flowDuration: 4,
    flowIntensity: 'moderado',
    menstruationDays: {},
    ovulationDays: [],
    pmsDays: []
  })
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([])
  const [newShoppingItem, setNewShoppingItem] = useState('')
  const [showCycleModal, setShowCycleModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedDayStatus, setSelectedDayStatus] = useState<DayStatus>({})
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    shopping: true,
    cycle: true,
    mood: true,
    food: true
  })

  // Verificar se usuário já está logado
  useEffect(() => {
    const savedUser = localStorage.getItem('lumiUser')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      setUserType(userData.isPremium ? 'premium' : 'free')
      setCurrentScreen('home')
      
      // Carregar dados do usuário
      const savedTasks = localStorage.getItem(`lumiTasks_${userData.email}`)
      if (savedTasks) setTasks(JSON.parse(savedTasks))
      
      const savedMoodHistory = localStorage.getItem(`lumiMoodHistory_${userData.email}`)
      if (savedMoodHistory) setMoodHistory(JSON.parse(savedMoodHistory))

      const savedCycleData = localStorage.getItem(`lumiCycleData_${userData.email}`)
      if (savedCycleData) setCycleData(JSON.parse(savedCycleData))

      const savedShoppingList = localStorage.getItem(`lumiShoppingList_${userData.email}`)
      if (savedShoppingList) setShoppingList(JSON.parse(savedShoppingList))

      const savedNotificationSettings = localStorage.getItem(`lumiNotifications_${userData.email}`)
      if (savedNotificationSettings) setNotificationSettings(JSON.parse(savedNotificationSettings))
    }
  }, [])

  // Sistema de notificações
  useEffect(() => {
    if (!user) return

    const scheduleNotifications = () => {
      // 1. Lista de Compras - 08:00
      if (notificationSettings.shopping && shoppingList.some(item => !item.completed)) {
        const pendingItems = shoppingList.filter(item => !item.completed)
        const itemText = pendingItems.length === 1 ? pendingItems[0].text : `${pendingItems.length} itens`
        scheduleNotification('08:00', `Você precisa comprar ${itemText}. Marque OK se já tiver comprado 💛`)
      }

      // 2. Ciclo Menstrual - 12:00 (Premium)
      if (notificationSettings.cycle && userType === 'premium' && cycleData.lastPeriodStart) {
        const lastPeriod = new Date(cycleData.lastPeriodStart)
        const nextPeriod = new Date(lastPeriod.getTime() + (cycleData.cycleDuration * 24 * 60 * 60 * 1000))
        const today = new Date()
        const daysUntilPeriod = Math.ceil((nextPeriod.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))

        const cycleMessages = {
          5: "Faltam 5 dias para sua menstruação 💮 Cuide-se e se prepare com carinho.",
          4: "Faltam 4 dias para sua menstruação 🌷 Aproveite para se organizar e relaxar.",
          3: "Faltam 3 dias para sua menstruação 🌼 Que tal separar absorventes e cuidar da alimentação?",
          2: "Faltam 2 dias para sua menstruação 💗 Respire fundo, seu corpo está se preparando.",
          1: "Amanhã deve começar seu ciclo menstrual🌸 Reserve um tempinho pra você.",
          0: "Hoje começa seu ciclo 💞 Hidrate-se e descanse, você está se cuidando."
        }

        if (daysUntilPeriod >= 0 && daysUntilPeriod <= 5) {
          scheduleNotification('12:00', cycleMessages[daysUntilPeriod as keyof typeof cycleMessages])
        }
      }

      // 3. Humor - 10:00
      if (notificationSettings.mood) {
        const today = new Date().toISOString().split('T')[0]
        const todayMood = moodHistory.find(entry => entry.date === today)
        if (!todayMood) {
          scheduleNotification('10:00', "Você ainda não anotou seu humor hoje 🌷 Entre na Lumi para atualizar e receber sua mensagem do dia.")
        }
      }

      // 4. Alimentação - Múltiplos horários
      if (notificationSettings.food) {
        const mealTimes = [
          { time: '06:45', meal: 'Café da manhã' },
          { time: '08:45', meal: 'Lanche da manhã' },
          { time: '10:45', meal: 'Almoço' },
          { time: '14:45', meal: 'Lanche da tarde' },
          { time: '18:45', meal: 'Janta' },
          { time: '20:45', meal: 'Lanche da noite' }
        ]

        mealTimes.forEach(({ time, meal }) => {
          scheduleNotification(time, "Vamos escolher sua próxima receita juntas? 🍽️ Abra a Lumi e inspire-se!")
        })
      }
    }

    const scheduleNotification = (time: string, message: string) => {
      const [hours, minutes] = time.split(':').map(Number)
      const now = new Date()
      const scheduledTime = new Date()
      scheduledTime.setHours(hours, minutes, 0, 0)

      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1)
      }

      const timeUntilNotification = scheduledTime.getTime() - now.getTime()

      setTimeout(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Lumi 🌷', {
            body: message,
            icon: 'https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/bfb85e76-c73a-4a92-8927-0bb9b158e97f.png'
          })
        }
      }, timeUntilNotification)
    }

    // Solicitar permissão para notificações
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    scheduleNotifications()
  }, [user, notificationSettings, shoppingList, cycleData, moodHistory, userType])

  // Salvar dados do usuário
  const saveUserData = (userData: User) => {
    localStorage.setItem('lumiUser', JSON.stringify(userData))
    localStorage.setItem(`lumiTasks_${userData.email}`, JSON.stringify(tasks))
    localStorage.setItem(`lumiMoodHistory_${userData.email}`, JSON.stringify(moodHistory))
    localStorage.setItem(`lumiCycleData_${userData.email}`, JSON.stringify(cycleData))
    localStorage.setItem(`lumiShoppingList_${userData.email}`, JSON.stringify(shoppingList))
    localStorage.setItem(`lumiNotifications_${userData.email}`, JSON.stringify(notificationSettings))
  }

  const moods = [
    { name: 'feliz', emoji: '😊' },
    { name: 'triste', emoji: '😢' },
    { name: 'ansiosa', emoji: '😰' },
    { name: 'cansada', emoji: '😴' },
    { name: 'motivada', emoji: '💪' },
    { name: 'animada', emoji: '🤩' }
  ]

  const mealPeriods = [
    { id: 'cafe-da-manha', name: 'Café da Manhã', emoji: '🌅' },
    { id: 'lanche-matinal', name: 'Lanche Matinal', emoji: '☕' },
    { id: 'almoco', name: 'Almoço', emoji: '🍽️' },
    { id: 'lanche-tarde', name: 'Lanche da Tarde', emoji: '🧁' },
    { id: 'jantar', name: 'Jantar', emoji: '🌙' },
    { id: 'lanche-noite', name: 'Lanche da Noite', emoji: '🌃' },
    { id: 'bebidas', name: 'Bebidas', emoji: '🥤' }
  ]

  const motivationalPhrases = {
    feliz: [
      "Que alegria te ver assim radiante! Continue espalhando essa luz! ✨",
      "Sua felicidade é contagiante! Aproveite cada momento! 🌟",
      "Dias assim merecem ser celebrados! Você está brilhando! 💫"
    ],
    triste: [
      "Está tudo bem sentir assim às vezes. Você é mais forte do que imagina 💙",
      "Lembre-se: depois da chuva, sempre vem o arco-íris 🌈",
      "Seus sentimentos são válidos. Amanhã pode ser um novo começo 🌱"
    ],
    ansiosa: [
      "Respire fundo. Você já superou 100% dos seus dias difíceis até agora 🌸",
      "A ansiedade não define você. Você é capaz e corajosa 💪",
      "Um passo de cada vez. Você não precisa resolver tudo hoje 🦋"
    ],
    cansada: [
      "Descansar não é preguiça, é autocuidado. Seja gentil consigo mesma 🌙",
      "Você tem feito o seu melhor. Permita-se uma pausa merecida ☁️",
      "Energia se renova com descanso. Cuide-se com carinho 💤"
    ],
    motivada: [
      "Essa energia é incrível! Canalize ela para seus sonhos! 🚀",
      "Quando você está motivada, o mundo inteiro conspira a seu favor! ⭐",
      "Sua determinação é inspiradora! Vá em frente! 🔥"
    ],
    animada: [
      "Que energia maravilhosa! O mundo precisa dessa sua vibração! ✨",
      "Sua animação é contagiante! Espalhe essa alegria por aí! 🎉",
      "Dias assim são presentes da vida! Aproveite cada segundo! 🌈"
    ]
  }

  const musicSuggestions = {
    feliz: ['Pop alegre', 'Música brasileira', 'Dance music'],
    triste: ['Lo-fi', 'Música clássica', 'Indie melancólico'],
    ansiosa: ['Música relaxante', 'Sons da natureza', 'Meditação'],
    cansada: ['Música ambiente', 'Jazz suave', 'Bossa nova'],
    motivada: ['Rock', 'Eletrônica', 'Hip hop'],
    animada: ['Funk', 'Pop dance', 'Reggaeton']
  }

  const recipes = {
    'cafe-da-manha': {
      doce: {
        title: "Panqueca de Banana Doce",
        ingredients: ["1 banana madura", "2 ovos", "1 colher de mel", "Canela a gosto"],
        instructions: ["Amasse a banana", "Misture com ovos e mel", "Cozinhe na frigideira", "Polvilhe canela"]
      },
      salgado: {
        title: "Omelete de Ervas",
        ingredients: ["3 ovos", "Cebolinha picada", "Sal e pimenta", "1 colher de azeite"],
        instructions: ["Bata os ovos", "Tempere com sal e pimenta", "Cozinhe na frigideira", "Adicione cebolinha"]
      },
      saudavel: {
        title: "Bowl de Açaí Natural",
        ingredients: ["100g açaí", "1/2 banana", "Granola", "Frutas vermelhas"],
        instructions: ["Bata o açaí", "Corte a banana", "Monte o bowl", "Finalize com granola"]
      }
    },
    'almoco': {
      doce: {
        title: "Frango Agridoce",
        ingredients: ["Peito de frango", "Molho agridoce", "Pimentão", "Cebola"],
        instructions: ["Corte o frango", "Refogue os legumes", "Adicione o molho", "Cozinhe por 15 min"]
      },
      salgado: {
        title: "Risotto de Cogumelos",
        ingredients: ["Arroz arbóreo", "Cogumelos", "Caldo de legumes", "Queijo parmesão"],
        instructions: ["Refogue o arroz", "Adicione caldo aos poucos", "Misture os cogumelos", "Finalize com queijo"]
      },
      saudavel: {
        title: "Salada Completa",
        ingredients: ["Mix de folhas", "Grão-de-bico", "Tomate cereja", "Azeite e limão"],
        instructions: ["Lave as folhas", "Corte os tomates", "Misture tudo", "Tempere com azeite e limão"]
      }
    }
  }

  // Verificar se email tem acesso Premium (simulação)
  const checkPremiumAccess = (email: string) => {
    // Lista simulada de emails premium
    const premiumEmails = ['premium@teste.com', 'vip@lumi.com']
    return premiumEmails.includes(email.toLowerCase())
  }

  const handleLoginSubmit = () => {
    if (loginStep === 'name' && loginForm.name.trim()) {
      setLoginStep('email')
    } else if (loginStep === 'email' && loginForm.email.trim()) {
      setLoginStep('password')
    } else if (loginStep === 'password') {
      // Criar/fazer login do usuário
      const isPremium = checkPremiumAccess(loginForm.email)
      const userData: User = {
        name: loginForm.name,
        email: loginForm.email,
        password: loginForm.password || undefined,
        isPremium
      }
      
      setUser(userData)
      setUserType(isPremium ? 'premium' : 'free')
      saveUserData(userData)
      setLoginStep('welcome')
      
      setTimeout(() => {
        setCurrentScreen('home')
      }, 3000)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('lumiUser')
    localStorage.removeItem(`lumiTasks_${user?.email}`)
    localStorage.removeItem(`lumiMoodHistory_${user?.email}`)
    localStorage.removeItem(`lumiCycleData_${user?.email}`)
    localStorage.removeItem(`lumiShoppingList_${user?.email}`)
    localStorage.removeItem(`lumiNotifications_${user?.email}`)
    setUser(null)
    setUserType('free')
    setCurrentScreen('login')
    setLoginStep('name')
    setLoginForm({ name: '', email: '', password: '' })
    setTasks([])
    setMoodHistory([])
    setCycleData({ cycleDuration: 28, flowDuration: 4, flowIntensity: 'moderado', menstruationDays: {}, ovulationDays: [], pmsDays: [] })
    setShoppingList([])
    setNotificationSettings({ shopping: true, cycle: true, mood: true, food: true })
  }

  const addTask = () => {
    if (newTask.trim() && tasks.length < (userType === 'premium' ? 10 : 3)) {
      const newTasks = [...tasks, { id: Date.now(), text: newTask, completed: false }]
      setTasks(newTasks)
      setNewTask('')
      if (user) {
        localStorage.setItem(`lumiTasks_${user.email}`, JSON.stringify(newTasks))
      }
    }
  }

  const toggleTask = (id: number) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    )
    setTasks(updatedTasks)
    if (user) {
      localStorage.setItem(`lumiTasks_${user.email}`, JSON.stringify(updatedTasks))
    }
  }

  const deleteTask = (id: number) => {
    const updatedTasks = tasks.filter(task => task.id !== id)
    setTasks(updatedTasks)
    if (user) {
      localStorage.setItem(`lumiTasks_${user.email}`, JSON.stringify(updatedTasks))
    }
  }

  const selectMood = (mood: string, emoji: string) => {
    setSelectedMood(mood)
    const today = new Date().toISOString().split('T')[0]
    const newEntry = { date: today, mood, emoji, note: moodNote }
    const updatedHistory = [newEntry, ...moodHistory.slice(0, userType === 'premium' ? 6 : 1)]
    setMoodHistory(updatedHistory)
    if (user) {
      localStorage.setItem(`lumiMoodHistory_${user.email}`, JSON.stringify(updatedHistory))
    }
    setMoodNote('')
  }

  const generateRecipe = () => {
    const mealType = selectedMealPeriod as keyof typeof recipes
    const foodType = foodInput.toLowerCase().includes('doce') ? 'doce' : 
                    foodInput.toLowerCase().includes('saudável') || foodInput.toLowerCase().includes('saudavel') ? 'saudavel' : 'salgado'
    
    if (recipes[mealType] && recipes[mealType][foodType as keyof typeof recipes[typeof mealType]]) {
      setCurrentRecipe(recipes[mealType][foodType as keyof typeof recipes[typeof mealType]])
    }
  }

  const addShoppingItem = () => {
    if (newShoppingItem.trim() && shoppingList.length < (userType === 'premium' ? 30 : 5)) {
      const newItems = [...shoppingList, { id: Date.now(), text: newShoppingItem, completed: false }]
      setShoppingList(newItems)
      setNewShoppingItem('')
      if (user) {
        localStorage.setItem(`lumiShoppingList_${user.email}`, JSON.stringify(newItems))
      }
    }
  }

  const toggleShoppingItem = (id: number) => {
    const updatedItems = shoppingList.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    )
    setShoppingList(updatedItems)
    if (user) {
      localStorage.setItem(`lumiShoppingList_${user.email}`, JSON.stringify(updatedItems))
    }
  }

  const deleteShoppingItem = (id: number) => {
    const updatedItems = shoppingList.filter(item => item.id !== id)
    setShoppingList(updatedItems)
    if (user) {
      localStorage.setItem(`lumiShoppingList_${user.email}`, JSON.stringify(updatedItems))
    }
  }

  const addIngredientToShopping = (ingredient: string) => {
    if (userType === 'premium' && shoppingList.length < 30) {
      const newItems = [...shoppingList, { id: Date.now(), text: ingredient, completed: false }]
      setShoppingList(newItems)
      if (user) {
        localStorage.setItem(`lumiShoppingList_${user.email}`, JSON.stringify(newItems))
      }
    }
  }

  const updateNotificationSettings = (category: keyof NotificationSettings, enabled: boolean) => {
    const updatedSettings = { ...notificationSettings, [category]: enabled }
    setNotificationSettings(updatedSettings)
    if (user) {
      localStorage.setItem(`lumiNotifications_${user.email}`, JSON.stringify(updatedSettings))
    }
  }

  // Funções para o calendário do ciclo
  const getCurrentMonth = () => {
    const now = new Date()
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      monthName: now.toLocaleDateString('pt-BR', { month: 'long' }),
      daysInMonth: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
      firstDayOfWeek: new Date(now.getFullYear(), now.getMonth(), 1).getDay()
    }
  }

  const getNextMonth = () => {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return {
      year: nextMonth.getFullYear(),
      month: nextMonth.getMonth(),
      monthName: nextMonth.toLocaleDateString('pt-BR', { month: 'long' }),
      daysInMonth: new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate(),
      firstDayOfWeek: nextMonth.getDay()
    }
  }

  const openCycleModal = (day: number) => {
    const currentMonth = getCurrentMonth()
    const dateString = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    setSelectedDay(day)
    setSelectedDayStatus({
      menstruation: cycleData.menstruationDays[dateString],
      ovulation: cycleData.ovulationDays.includes(dateString),
      pms: cycleData.pmsDays.includes(dateString)
    })
    setShowCycleModal(true)
  }

  const saveCycleStatus = () => {
    if (selectedDay === null) return

    const currentMonth = getCurrentMonth()
    const dateString = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    
    const updatedCycleData = { ...cycleData }
    
    // Atualizar menstruação
    if (selectedDayStatus.menstruation) {
      updatedCycleData.menstruationDays[dateString] = selectedDayStatus.menstruation
    } else {
      delete updatedCycleData.menstruationDays[dateString]
    }
    
    // Atualizar ovulação
    if (selectedDayStatus.ovulation) {
      if (!updatedCycleData.ovulationDays.includes(dateString)) {
        updatedCycleData.ovulationDays.push(dateString)
      }
    } else {
      updatedCycleData.ovulationDays = updatedCycleData.ovulationDays.filter(d => d !== dateString)
    }
    
    // Atualizar TPM
    if (selectedDayStatus.pms) {
      if (!updatedCycleData.pmsDays.includes(dateString)) {
        updatedCycleData.pmsDays.push(dateString)
      }
    } else {
      updatedCycleData.pmsDays = updatedCycleData.pmsDays.filter(d => d !== dateString)
    }
    
    setCycleData(updatedCycleData)
    if (user) {
      localStorage.setItem(`lumiCycleData_${user.email}`, JSON.stringify(updatedCycleData))
    }
    
    setShowCycleModal(false)
    setSelectedDay(null)
    setSelectedDayStatus({})
  }

  const removeCycleStatus = () => {
    if (selectedDay === null) return

    const currentMonth = getCurrentMonth()
    const dateString = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    
    const updatedCycleData = { ...cycleData }
    
    // Remover todas as marcações do dia
    delete updatedCycleData.menstruationDays[dateString]
    updatedCycleData.ovulationDays = updatedCycleData.ovulationDays.filter(d => d !== dateString)
    updatedCycleData.pmsDays = updatedCycleData.pmsDays.filter(d => d !== dateString)
    
    setCycleData(updatedCycleData)
    if (user) {
      localStorage.setItem(`lumiCycleData_${user.email}`, JSON.stringify(updatedCycleData))
    }
    
    setShowCycleModal(false)
    setSelectedDay(null)
    setSelectedDayStatus({})
  }

  const getDayBackground = (day: number, isCurrentMonth: boolean = true) => {
    if (!isCurrentMonth) return 'text-gray-300'
    
    const currentMonth = getCurrentMonth()
    const dateString = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    const isToday = day === new Date().getDate() && currentMonth.month === new Date().getMonth()
    
    // Verificar se tem menstruação
    if (cycleData.menstruationDays[dateString]) {
      const intensity = cycleData.menstruationDays[dateString]
      if (intensity === 'leve') return isToday ? 'bg-[#F7A6B8] text-white' : 'bg-[#F7A6B8] text-gray-800'
      if (intensity === 'medio') return isToday ? 'bg-[#E94A4A] text-white' : 'bg-[#E94A4A] text-white'
      if (intensity === 'intenso') return isToday ? 'bg-[#9B1C31] text-white' : 'bg-[#9B1C31] text-white'
    }
    
    // Verificar se tem ovulação
    if (cycleData.ovulationDays.includes(dateString)) {
      return isToday ? 'bg-[#A7D8DE] text-gray-800' : 'bg-[#A7D8DE] text-gray-800'
    }
    
    // Verificar se tem TPM
    if (cycleData.pmsDays.includes(dateString)) {
      return isToday ? 'bg-[#D8D8D8] text-gray-800' : 'bg-[#D8D8D8] text-gray-800'
    }
    
    return isToday ? 'bg-rose-400 text-white' : 'hover:bg-white/50 text-gray-700'
  }

  const getDayIcons = (day: number, isCurrentMonth: boolean = true) => {
    if (!isCurrentMonth) return null
    
    const currentMonth = getCurrentMonth()
    const dateString = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    const icons = []
    
    // Ícone de ovulação
    if (cycleData.ovulationDays.includes(dateString)) {
      icons.push(<span key="ovulation" className="absolute top-0 right-0 text-xs">✨</span>)
    }
    
    // Ícone de TPM
    if (cycleData.pmsDays.includes(dateString)) {
      icons.push(<span key="pms" className="absolute top-0 left-0 text-xs">💭</span>)
    }
    
    return icons.length > 0 ? icons : null
  }

  const renderCalendar = (monthData: any, isCurrentMonth: boolean = true) => {
    const days = []
    const totalCells = 42 // 6 semanas × 7 dias
    
    // Dias vazios antes do primeiro dia do mês
    for (let i = 0; i < monthData.firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>)
    }
    
    // Dias do mês
    for (let day = 1; day <= monthData.daysInMonth; day++) {
      days.push(
        <div key={day} className="relative">
          <button
            onClick={() => isCurrentMonth && openCycleModal(day)}
            disabled={!isCurrentMonth}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all relative ${
              getDayBackground(day, isCurrentMonth)
            } ${!isCurrentMonth ? 'cursor-not-allowed' : ''}`}
          >
            {day}
            {getDayIcons(day, isCurrentMonth)}
          </button>
        </div>
      )
    }
    
    // Preencher células restantes
    while (days.length < totalCells) {
      days.push(<div key={`empty-end-${days.length}`} className="h-10"></div>)
    }
    
    return (
      <div className="grid grid-cols-7 gap-1 text-center">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(dayName => (
          <div key={dayName} className="text-xs font-medium text-gray-600 py-2">
            {dayName}
          </div>
        ))}
        {days}
      </div>
    )
  }

  const renderCycleModal = () => {
    if (!showCycleModal || selectedDay === null) return null

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-gradient-to-br from-rose-200/90 via-pink-200/90 to-rose-300/90 backdrop-blur-sm rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Dia {selectedDay}
            </h3>
            <button
              onClick={() => setShowCycleModal(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Menstruação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Menstruação
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="menstruation"
                    checked={selectedDayStatus.menstruation === 'leve'}
                    onChange={() => setSelectedDayStatus({
                      ...selectedDayStatus,
                      menstruation: selectedDayStatus.menstruation === 'leve' ? undefined : 'leve'
                    })}
                    className="text-rose-400"
                  />
                  <span className="text-sm text-gray-700">Fluxo leve</span>
                  <div className="w-4 h-4 rounded-full bg-[#F7A6B8]"></div>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="menstruation"
                    checked={selectedDayStatus.menstruation === 'medio'}
                    onChange={() => setSelectedDayStatus({
                      ...selectedDayStatus,
                      menstruation: selectedDayStatus.menstruation === 'medio' ? undefined : 'medio'
                    })}
                    className="text-rose-400"
                  />
                  <span className="text-sm text-gray-700">Fluxo médio</span>
                  <div className="w-4 h-4 rounded-full bg-[#E94A4A]"></div>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="menstruation"
                    checked={selectedDayStatus.menstruation === 'intenso'}
                    onChange={() => setSelectedDayStatus({
                      ...selectedDayStatus,
                      menstruation: selectedDayStatus.menstruation === 'intenso' ? undefined : 'intenso'
                    })}
                    className="text-rose-400"
                  />
                  <span className="text-sm text-gray-700">Fluxo intenso</span>
                  <div className="w-4 h-4 rounded-full bg-[#9B1C31]"></div>
                </label>
              </div>
            </div>

            {/* Ovulação */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedDayStatus.ovulation || false}
                  onChange={(e) => setSelectedDayStatus({
                    ...selectedDayStatus,
                    ovulation: e.target.checked
                  })}
                  className="text-rose-400"
                />
                <span className="text-sm text-gray-700">Ovulação</span>
                <div className="w-4 h-4 rounded-full bg-[#A7D8DE] flex items-center justify-center">
                  <span className="text-xs">✨</span>
                </div>
              </label>
            </div>

            {/* TPM */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedDayStatus.pms || false}
                  onChange={(e) => setSelectedDayStatus({
                    ...selectedDayStatus,
                    pms: e.target.checked
                  })}
                  className="text-rose-400"
                />
                <span className="text-sm text-gray-700">TPM</span>
                <div className="w-4 h-4 rounded-full bg-[#D8D8D8] flex items-center justify-center">
                  <span className="text-xs">💭</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={saveCycleStatus}
              className="flex-1 bg-rose-400 text-white py-2 px-4 rounded-xl hover:bg-rose-500 transition-colors"
            >
              Salvar
            </button>
            <button
              onClick={removeCycleStatus}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-xl hover:bg-gray-400 transition-colors"
            >
              Remover
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderLogin = () => {
    if (loginStep === 'welcome') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-300 to-rose-400 flex items-center justify-center p-4">
          <div className="max-w-md mx-auto text-center">
            <img 
              src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/bfb85e76-c73a-4a92-8927-0bb9b158e97f.png" 
              alt="Lumi Logo" 
              className="h-20 w-20 rounded-full mx-auto mb-6"
            />
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Seja muito bem-vinda, {user?.name}! 🌷
              </h1>
              <p className="text-gray-700 leading-relaxed mb-4">
                Que alegria ter você por aqui.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Estou pronta para iluminar o seu dia — com calma, propósito e um toque de carinho.
              </p>
              
              {user?.isPremium && (
                <div className="mt-6 p-4 bg-gradient-to-r from-rose-400 to-pink-400 rounded-xl text-white">
                  <p className="font-semibold mb-1">Acesso Premium confirmado, {user.name}!</p>
                  <p className="text-sm text-rose-100">
                    Você agora faz parte do Lumi+. Seus dados e mensagens serão salvos automaticamente.
                  </p>
                </div>
              )}
              
              {!user?.isPremium && (
                <div className="mt-6 p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl">
                  <p className="text-amber-700 text-sm mb-2">
                    Alguns recursos estão disponíveis apenas no Lumi+.
                  </p>
                  <p className="text-amber-700 text-sm">
                    Quer desbloquear sua versão Premium e ter acesso às mensagens exclusivas, receitas salvas e planos personalizados?
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-300 via-pink-300 to-rose-400 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <img 
              src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/bfb85e76-c73a-4a92-8927-0bb9b158e97f.png" 
              alt="Lumi Logo" 
              className="h-20 w-20 rounded-full mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Lumi</h1>
            <p className="text-gray-600">Ilumine seu dia</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            {loginStep === 'name' && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                  Olá, sou a Lumi — sua amiga para dias mais leves. 🌷
                </h2>
                <p className="text-gray-700 mb-6 text-center">
                  Que nome você gostaria de ser chamada?
                </p>
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={loginForm.name}
                      onChange={(e) => setLoginForm({...loginForm, name: e.target.value})}
                      placeholder="Seu nome"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                      onKeyPress={(e) => e.key === 'Enter' && handleLoginSubmit()}
                    />
                  </div>
                  <button
                    onClick={handleLoginSubmit}
                    disabled={!loginForm.name.trim()}
                    className="w-full bg-rose-400 text-white py-3 px-4 rounded-xl hover:bg-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuar
                  </button>
                </div>
              </>
            )}

            {loginStep === 'email' && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                  Perfeito, {loginForm.name}! 💕
                </h2>
                <p className="text-gray-700 mb-6 text-center">
                  Agora, digite seu e-mail para salvar suas mensagens e receitas.
                </p>
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                      placeholder="seu@email.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                      onKeyPress={(e) => e.key === 'Enter' && handleLoginSubmit()}
                    />
                  </div>
                  <button
                    onClick={handleLoginSubmit}
                    disabled={!loginForm.email.trim()}
                    className="w-full bg-rose-400 text-white py-3 px-4 rounded-xl hover:bg-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuar
                  </button>
                  <button
                    onClick={() => setLoginStep('name')}
                    className="w-full text-gray-600 py-2 text-sm hover:text-gray-800 transition-colors"
                  >
                    Voltar
                  </button>
                </div>
              </>
            )}

            {loginStep === 'password' && (
              <>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                  Deseja criar uma senha? 🔒
                </h2>
                <p className="text-gray-700 mb-6 text-center text-sm">
                  Para salvar seu progresso e acessar o Lumi em qualquer dispositivo
                </p>
                <div className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                      placeholder="Senha (opcional)"
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                      onKeyPress={(e) => e.key === 'Enter' && handleLoginSubmit()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <button
                    onClick={handleLoginSubmit}
                    className="w-full bg-rose-400 text-white py-3 px-4 rounded-xl hover:bg-rose-500 transition-colors"
                  >
                    Entrar / Criar conta
                  </button>
                  <button
                    onClick={() => setLoginStep('email')}
                    className="w-full text-gray-600 py-2 text-sm hover:text-gray-800 transition-colors"
                  >
                    Voltar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderHome = () => (
    <div className="min-h-screen bg-gradient-to-br from-rose-200 via-pink-200 to-rose-300 p-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* Header com Logo */}
        <div className="flex items-center gap-3 mb-8 pt-8">
          <img 
            src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/bfb85e76-c73a-4a92-8927-0bb9b158e97f.png" 
            alt="Lumi Logo" 
            className="h-12 w-12 rounded-full"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">Olá, {user?.name}!</h1>
            <span className="text-sm text-gray-600 bg-white/50 px-2 py-1 rounded-full">
              {userType === 'premium' ? 'Premium' : 'Gratuito'}
            </span>
          </div>
          <button
            onClick={() => setCurrentScreen('notifications')}
            className="text-gray-600 hover:text-gray-800 p-2"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Sair
          </button>
        </div>

        {/* Mensagem de boas-vindas */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg border border-white/20">
          <p className="text-gray-700 text-center leading-relaxed">
            "Oi, eu sou a Lumi 🌷 Sua companheira de luz. Vamos iluminar o seu dia juntas?"
          </p>
        </div>

        {/* Cards de acesso rápido */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setCurrentScreen('planner')}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:bg-white/80 transition-all"
          >
            <Calendar className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-gray-700 font-medium">Planner</p>
          </button>
          
          <button
            onClick={() => setCurrentScreen('mood')}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:bg-white/80 transition-all"
          >
            <Heart className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-gray-700 font-medium">Humor</p>
          </button>
          
          <button
            onClick={() => setCurrentScreen('food')}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:bg-white/80 transition-all"
          >
            <Utensils className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-gray-700 font-medium">Alimentação</p>
          </button>
          
          <button
            onClick={() => setCurrentScreen('cycle')}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:bg-white/80 transition-all"
          >
            <Activity className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-gray-700 font-medium">Meu Ciclo</p>
          </button>

          <button
            onClick={() => setCurrentScreen('shopping')}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:bg-white/80 transition-all"
          >
            <ShoppingCart className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-gray-700 font-medium">Lista de Compras</p>
          </button>
          
          <button
            onClick={() => setCurrentScreen('memory')}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:bg-white/80 transition-all"
          >
            <Sparkles className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-gray-700 font-medium">Memória</p>
          </button>
        </div>

        {/* Frase motivacional do dia */}
        {selectedMood && (
          <div className="bg-gradient-to-r from-rose-400 to-pink-400 rounded-2xl p-6 shadow-lg text-white">
            <h3 className="font-semibold mb-2">Sua frase do dia:</h3>
            <p className="text-sm leading-relaxed">
              {motivationalPhrases[selectedMood as keyof typeof motivationalPhrases][0]}
            </p>
          </div>
        )}

        {/* Convite Premium para usuários gratuitos */}
        {!user?.isPremium && (
          <div className="mt-6 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-4 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-amber-600" />
              <p className="font-medium text-amber-700">Desbloqueie o Lumi+ Premium</p>
            </div>
            <p className="text-sm text-amber-600 mb-3">
              Acesso às mensagens exclusivas, receitas salvas e planos personalizados
            </p>
            <button
              onClick={() => setCurrentScreen('premium')}
              className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-600 transition-colors"
            >
              Desbloquear Lumi+ Premium
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const renderNotifications = () => (
    <div className="min-h-screen bg-gradient-to-br from-rose-200 via-pink-200 to-rose-300 p-4 pb-20">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6 pt-8">
          <button onClick={() => setCurrentScreen('home')}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Configurações de Notificações</h1>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Sistema de Notificações da Lumi</h2>
          <p className="text-sm text-gray-600 mb-6">
            Configure quando você quer receber lembretes empáticos e acolhedores da Lumi 🌷
          </p>

          <div className="space-y-6">
            {/* Lista de Compras */}
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="w-5 h-5 text-rose-500" />
                  <h3 className="font-medium text-gray-800">Lista de Compras</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Lembrete diário às 08:00 quando houver itens não comprados
                </p>
                <p className="text-xs text-gray-500 italic">
                  "Você precisa comprar {'{item / itens}'}. Marque OK se já tiver comprado 💛"
                </p>
              </div>
              <button
                onClick={() => updateNotificationSettings('shopping', !notificationSettings.shopping)}
                className={`p-2 rounded-lg transition-colors ${
                  notificationSettings.shopping 
                    ? 'bg-rose-400 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {notificationSettings.shopping ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              </button>
            </div>

            {/* Ciclo Menstrual */}
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-rose-500" />
                  <h3 className="font-medium text-gray-800">Ciclo Menstrual</h3>
                  {userType === 'free' && <Crown className="w-4 h-4 text-amber-500" />}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Contagem regressiva às 12:00 (5 dias antes da menstruação)
                  {userType === 'free' && <span className="text-amber-600"> - Exclusivo Premium</span>}
                </p>
                <p className="text-xs text-gray-500 italic">
                  "Faltam X dias para sua menstruação 💮 Cuide-se e se prepare com carinho."
                </p>
              </div>
              <button
                onClick={() => updateNotificationSettings('cycle', !notificationSettings.cycle)}
                disabled={userType === 'free'}
                className={`p-2 rounded-lg transition-colors ${
                  notificationSettings.cycle && userType === 'premium'
                    ? 'bg-rose-400 text-white' 
                    : 'bg-gray-200 text-gray-500'
                } ${userType === 'free' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {notificationSettings.cycle && userType === 'premium' ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              </button>
            </div>

            {/* Humor */}
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  <h3 className="font-medium text-gray-800">Humor</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Lembrete às 10:00 se ainda não registrou o humor do dia
                </p>
                <p className="text-xs text-gray-500 italic">
                  "Você ainda não anotou seu humor hoje 🌷 Entre na Lumi para atualizar e receber sua mensagem do dia."
                </p>
              </div>
              <button
                onClick={() => updateNotificationSettings('mood', !notificationSettings.mood)}
                className={`p-2 rounded-lg transition-colors ${
                  notificationSettings.mood 
                    ? 'bg-rose-400 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {notificationSettings.mood ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              </button>
            </div>

            {/* Alimentação */}
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Utensils className="w-5 h-5 text-rose-500" />
                  <h3 className="font-medium text-gray-800">Alimentação / Receitas</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Lembretes nos horários das refeições (6 vezes ao dia)
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Café da manhã → 06:45</p>
                  <p>• Lanche da manhã → 08:45</p>
                  <p>• Almoço → 10:45</p>
                  <p>• Lanche da tarde → 14:45</p>
                  <p>• Janta → 18:45</p>
                  <p>• Lanche da noite → 20:45</p>
                </div>
                <p className="text-xs text-gray-500 italic mt-2">
                  "Vamos escolher sua próxima receita juntas? 🍽️ Abra a Lumi e inspire-se!"
                </p>
              </div>
              <button
                onClick={() => updateNotificationSettings('food', !notificationSettings.food)}
                className={`p-2 rounded-lg transition-colors ${
                  notificationSettings.food 
                    ? 'bg-rose-400 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {notificationSettings.food ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-rose-50 rounded-xl">
            <h4 className="font-medium text-gray-800 mb-2">Extras:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Todas as notificações usam o ícone da Lumi e som suave</li>
              <li>• Redirecionamento direto para a aba correspondente</li>
              <li>• Mensagens sempre empáticas e acolhedoras</li>
              <li>• Horários otimizados para sua rotina</li>
            </ul>
          </div>

          {userType === 'free' && (
            <div className="mt-4 p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-amber-600" />
                <p className="font-medium text-amber-700">Notificações Premium</p>
              </div>
              <p className="text-sm text-amber-600 mb-3">
                Desbloqueie notificações do ciclo menstrual com contagem regressiva personalizada
              </p>
              <button
                onClick={() => setCurrentScreen('premium')}
                className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-600 transition-colors"
              >
                Conhecer Premium
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderPlanner = () => (
    <div className="min-h-screen bg-gradient-to-br from-rose-200 via-pink-200 to-rose-300 p-4 pb-20">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6 pt-8">
          <button onClick={() => setCurrentScreen('home')}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Planner Diário</h1>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Suas tarefas de hoje</h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Nova tarefa..."
              className="flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
            />
            <button
              onClick={addTask}
              disabled={tasks.length >= (userType === 'premium' ? 10 : 3)}
              className="bg-rose-400 text-white p-3 rounded-xl hover:bg-rose-500 transition-colors disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            {tasks.length}/{userType === 'premium' ? 10 : 3} tarefas
          </p>

          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-5 h-5 rounded-full border-2 ${
                    task.completed ? 'bg-rose-400 border-rose-400' : 'border-gray-300'
                  }`}
                >
                  {task.completed && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />}
                </button>
                <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                  {task.text}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {tasks.length >= (userType === 'premium' ? 10 : 3) && (
            <div className="mt-4 p-3 bg-amber-100 rounded-xl">
              <p className="text-sm text-amber-700">
                {userType === 'premium' 
                  ? 'Limite de tarefas atingido!' 
                  : 'Limite gratuito atingido! Assine Premium para até 10 tarefas.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderMood = () => (
    <div className="min-h-screen bg-gradient-to-br from-rose-200 via-pink-200 to-rose-300 p-4 pb-20">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6 pt-8">
          <button onClick={() => setCurrentScreen('home')}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Check-in Emocional</h1>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Como você está se sentindo hoje? 💕</h2>
          
          {/* Diário do Humor */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Como você está se sentindo hoje?
            </label>
            <textarea
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="Escreva livremente sobre seus sentimentos..."
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none h-24"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            {moods.map(mood => (
              <button
                key={mood.name}
                onClick={() => selectMood(mood.name, mood.emoji)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedMood === mood.name
                    ? 'border-rose-400 bg-rose-50'
                    : 'border-gray-200 bg-white/50 hover:border-rose-300'
                }`}
              >
                <div className="text-2xl mb-1">{mood.emoji}</div>
                <div className="text-sm text-gray-700 capitalize">{mood.name}</div>
              </button>
            ))}
          </div>

          {selectedMood && (
            <>
              <div className="bg-gradient-to-r from-rose-400 to-pink-400 rounded-xl p-4 text-white mb-4">
                <h3 className="font-semibold mb-2">Mensagem para você:</h3>
                <p className="text-sm leading-relaxed">
                  {motivationalPhrases[selectedMood as keyof typeof motivationalPhrases][
                    Math.floor(Math.random() * motivationalPhrases[selectedMood as keyof typeof motivationalPhrases].length)
                  ]}
                </p>
              </div>

              {/* Sugestão Musical */}
              <div className="bg-white/80 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Music className="w-5 h-5 text-rose-500" />
                  <h3 className="font-semibold text-gray-800">Sugestão Musical</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Baseado no seu humor de hoje:
                </p>
                <div className="flex flex-wrap gap-2">
                  {musicSuggestions[selectedMood as keyof typeof musicSuggestions].map((genre, index) => (
                    <span key={index} className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm">
                      {genre}
                    </span>
                  ))}
                </div>
                {userType === 'premium' && (
                  <p className="text-xs text-gray-500 mt-2">
                    💎 Premium: Sugestões personalizadas baseadas em seus estilos favoritos
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  const renderCycle = () => {
    const currentMonth = getCurrentMonth()
    const nextMonth = getNextMonth()

    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-200 via-pink-200 to-rose-300 p-4 pb-20">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-6 pt-8">
            <button onClick={() => setCurrentScreen('home')}>
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Meu Ciclo</h1>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Configurações do Ciclo</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duração média do ciclo (dias)
                </label>
                <input
                  type="number"
                  value={cycleData.cycleDuration}
                  onChange={(e) => setCycleData({...cycleData, cycleDuration: parseInt(e.target.value) || 28})}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  min="21"
                  max="35"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duração média do fluxo (dias)
                </label>
                <input
                  type="number"
                  value={cycleData.flowDuration}
                  onChange={(e) => setCycleData({...cycleData, flowDuration: parseInt(e.target.value) || 4})}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  min="2"
                  max="8"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intensidade do fluxo
                </label>
                <select
                  value={cycleData.flowIntensity}
                  onChange={(e) => setCycleData({...cycleData, flowIntensity: e.target.value as 'leve' | 'moderado' | 'intenso'})}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                >
                  <option value="leve">Leve</option>
                  <option value="moderado">Moderado</option>
                  <option value="intenso">Intenso</option>
                </select>
              </div>
            </div>

            {/* Calendário do Mês Atual */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-800 mb-3 capitalize">
                {currentMonth.monthName} {currentMonth.year}
              </h3>
              <div className="bg-white/50 rounded-xl p-4">
                {renderCalendar(currentMonth, true)}
              </div>
              <div className="mt-3 text-xs text-gray-600 space-y-1">
                <p>• Toque em um dia para marcar status do ciclo</p>
              </div>
            </div>

            {/* Calendário do Próximo Mês (Premium) */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-800 mb-3 capitalize">
                {nextMonth.monthName} {nextMonth.year}
              </h3>
              <div className="relative">
                <div className={`bg-white/30 rounded-xl p-4 ${userType === 'free' ? 'opacity-50' : ''}`}>
                  {renderCalendar(nextMonth, userType === 'premium')}
                </div>
                {userType === 'free' && (
                  <div className="absolute inset-0 bg-white/20 rounded-xl flex items-center justify-center">
                    <button
                      onClick={() => setCurrentScreen('premium')}
                      className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-600 transition-colors flex items-center gap-2"
                    >
                      <Crown className="w-4 h-4" />
                      Assinar Premium
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Legenda das Marcações */}
            <div className="bg-white/50 rounded-xl p-4 mb-4">
              <h4 className="font-medium text-gray-800 mb-3">Legenda:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#F7A6B8]"></div>
                  <span className="text-gray-700">Fluxo leve</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#E94A4A]"></div>
                  <span className="text-gray-700">Fluxo médio</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#9B1C31]"></div>
                  <span className="text-gray-700">Fluxo intenso</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#A7D8DE] flex items-center justify-center">
                    <span className="text-xs">✨</span>
                  </div>
                  <span className="text-gray-700">Ovulação</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#D8D8D8] flex items-center justify-center">
                    <span className="text-xs">💭</span>
                  </div>
                  <span className="text-gray-700">TPM</span>
                </div>
              </div>
            </div>

            {userType === 'premium' ? (
              <div className="bg-gradient-to-r from-rose-400 to-pink-400 rounded-xl p-4 text-white">
                <h3 className="font-semibold mb-2">Previsão do Próximo Ciclo</h3>
                <p className="text-sm">
                  Baseado nos seus dados, seu próximo ciclo deve começar em aproximadamente{' '}
                  {cycleData.lastPeriodStart ? 
                    Math.max(0, cycleData.cycleDuration - Math.floor((Date.now() - new Date(cycleData.lastPeriodStart).getTime()) / (1000 * 60 * 60 * 24)))
                    : cycleData.cycleDuration
                  } dias.
                </p>
              </div>
            ) : (
              <div className="bg-gray-100/70 rounded-xl p-4 relative">
                <div className="absolute inset-0 bg-white/50 rounded-xl flex items-center justify-center">
                  <button
                    onClick={() => setCurrentScreen('premium')}
                    className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-600 transition-colors flex items-center gap-2"
                  >
                    <Crown className="w-4 h-4" />
                    Assinar Premium
                  </button>
                </div>
                <h3 className="font-semibold mb-2 text-gray-400">Previsão do Próximo Ciclo</h3>
                <p className="text-sm text-gray-400">
                  Previsão automática disponível apenas no Premium
                </p>
              </div>
            )}
          </div>
        </div>
        {renderCycleModal()}
      </div>
    )
  }

  const renderShopping = () => (
    <div className="min-h-screen bg-gradient-to-br from-rose-200 via-pink-200 to-rose-300 p-4 pb-20">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6 pt-8">
          <button onClick={() => setCurrentScreen('home')}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Lista de Compras</h1>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Seus itens</h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newShoppingItem}
              onChange={(e) => setNewShoppingItem(e.target.value)}
              placeholder="Novo item..."
              className="flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
              onKeyPress={(e) => e.key === 'Enter' && addShoppingItem()}
            />
            <button
              onClick={addShoppingItem}
              disabled={shoppingList.length >= (userType === 'premium' ? 30 : 5)}
              className="bg-rose-400 text-white p-3 rounded-xl hover:bg-rose-500 transition-colors disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            {shoppingList.length}/{userType === 'premium' ? 30 : 5} itens
          </p>

          <div className="space-y-2">
            {shoppingList.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                <button
                  onClick={() => toggleShoppingItem(item.id)}
                  className={`w-5 h-5 rounded-full border-2 ${
                    item.completed ? 'bg-rose-400 border-rose-400' : 'border-gray-300'
                  }`}
                >
                  {item.completed && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />}
                </button>
                <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                  {item.text}
                </span>
                <button
                  onClick={() => deleteShoppingItem(item.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {shoppingList.length >= (userType === 'premium' ? 30 : 5) && (
            <div className="mt-4 p-3 bg-amber-100 rounded-xl">
              <p className="text-sm text-amber-700">
                {userType === 'premium' 
                  ? 'Limite de itens atingido!' 
                  : 'Limite gratuito atingido! Assine Premium para até 30 itens.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderFood = () => (
    <div className="min-h-screen bg-gradient-to-br from-rose-200 via-pink-200 to-rose-300 p-4 pb-20">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6 pt-8">
          <button onClick={() => setCurrentScreen('home')}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Alimentação</h1>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">O que você quer comer hoje? 🍽️</h2>
          
          {/* Seleção do período da refeição */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Período da refeição</label>
            <select
              value={selectedMealPeriod}
              onChange={(e) => setSelectedMealPeriod(e.target.value as MealPeriod)}
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
            >
              {mealPeriods.map(period => (
                <option key={period.id} value={period.id}>
                  {period.emoji} {period.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={foodInput}
              onChange={(e) => setFoodInput(e.target.value)}
              placeholder="Ex: algo doce, salgado ou saudável..."
              className="flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
            <button
              onClick={generateRecipe}
              className="bg-rose-400 text-white px-4 py-3 rounded-xl hover:bg-rose-500 transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Gerar Receita
            </button>
          </div>

          {currentRecipe && (
            <div className="bg-white/80 rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">{currentRecipe.title}</h3>
              
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-700">Ingredientes:</h4>
                  {userType === 'premium' ? (
                    <button
                      onClick={() => currentRecipe.ingredients.forEach(ingredient => addIngredientToShopping(ingredient))}
                      className="text-xs bg-rose-400 text-white px-2 py-1 rounded-lg hover:bg-rose-500 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Lista de Compras
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentScreen('premium')}
                      className="text-xs bg-gray-300 text-gray-500 px-2 py-1 rounded-lg flex items-center gap-1"
                    >
                      <Crown className="w-3 h-3" />
                      Ative o Premium
                    </button>
                  )}
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  {currentRecipe.ingredients.map((ingredient, index) => (
                    <li key={index}>• {ingredient}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-1">Modo de preparo:</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  {currentRecipe.instructions.map((instruction, index) => (
                    <li key={index}>{index + 1}. {instruction}</li>
                  ))}
                </ol>
              </div>

              {/* Botão Salvar Receita */}
              {userType === 'premium' ? (
                <button className="w-full bg-rose-400 text-white py-2 px-4 rounded-xl hover:bg-rose-500 transition-colors flex items-center justify-center gap-2">
                  <Star className="w-4 h-4" />
                  Salvar Receita
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentScreen('premium')}
                  className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-xl flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  Assinar Premium para Salvar
                </button>
              )}
            </div>
          )}

          {/* Atalho para Lista de Compras */}
          <div className="mt-4">
            <button
              onClick={() => setCurrentScreen('shopping')}
              className="w-full bg-white/50 border border-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-white/70 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Ver Lista de Compras ({shoppingList.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderMemory = () => (
    <div className="min-h-screen bg-gradient-to-br from-rose-200 via-pink-200 to-rose-300 p-4 pb-20">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6 pt-8">
          <button onClick={() => setCurrentScreen('home')}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Memória Emocional</h1>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Seus últimos {userType === 'premium' ? '7' : '2'} dias
          </h2>
          
          <div className="space-y-3">
            {moodHistory.slice(0, userType === 'premium' ? 7 : 2).map((entry, index) => (
              <div key={index} className="p-3 bg-white/50 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">{entry.emoji}</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 capitalize">{entry.mood}</p>
                    <p className="text-sm text-gray-600">{entry.date}</p>
                  </div>
                </div>
                {entry.note && (
                  <p className="text-sm text-gray-600 italic pl-11">
                    "{entry.note}"
                  </p>
                )}
              </div>
            ))}
          </div>

          {userType === 'free' && (
            <div className="mt-4 p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl">
              <p className="text-sm text-amber-700 mb-2">
                💡 Com o Premium, você pode ver até 7 dias de histórico emocional!
              </p>
              <button
                onClick={() => setCurrentScreen('premium')}
                className="text-sm bg-amber-500 text-white px-3 py-1 rounded-lg hover:bg-amber-600 transition-colors"
              >
                Conhecer Premium
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderPremium = () => (
    <div className="min-h-screen bg-gradient-to-br from-rose-200 via-pink-200 to-rose-300 p-4 pb-20">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6 pt-8">
          <button onClick={() => setCurrentScreen('home')}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Lumi Premium</h1>
        </div>

        <div className="bg-gradient-to-r from-rose-400 to-pink-400 rounded-2xl p-6 shadow-lg text-white mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-8 h-8" />
            <h2 className="text-xl font-bold">Desbloqueie todo o potencial da Lumi</h2>
          </div>
          <p className="text-rose-100">
            Tenha uma experiência completa com sua assistente pessoal
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Funcionalidades Premium:</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-rose-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">Planner Expandido</p>
                <p className="text-sm text-gray-600">Até 10 tarefas por dia (vs 3 gratuitas)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-rose-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">Memória Emocional Completa</p>
                <p className="text-sm text-gray-600">7 dias de histórico (vs 2 dias gratuitos)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-rose-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">Frases Personalizadas</p>
                <p className="text-sm text-gray-600">Mensagens baseadas no seu humor dos últimos dias</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Utensils className="w-5 h-5 text-rose-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">Receitas Ilimitadas</p>
                <p className="text-sm text-gray-600">Até 5 receitas por refeição (vs 1 gratuita)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-rose-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">Salvar Receitas Favoritas</p>
                <p className="text-sm text-gray-600">Guarde suas receitas preferidas para acessar depois</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-rose-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">Previsão do Ciclo Menstrual</p>
                <p className="text-sm text-gray-600">Previsão automática baseada nos seus dados</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShoppingCart className="w-5 h-5 text-rose-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">Lista de Compras Expandida</p>
                <p className="text-sm text-gray-600">Até 30 itens (vs 5 gratuitos) + adicionar ingredientes automaticamente</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Music className="w-5 h-5 text-rose-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">Sugestões Musicais Personalizadas</p>
                <p className="text-sm text-gray-600">Baseadas no seu humor + estilos favoritos</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-rose-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">Notificações do Ciclo Menstrual</p>
                <p className="text-sm text-gray-600">Contagem regressiva personalizada com mensagens empáticas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="text-center mb-4">
            <p className="text-2xl font-bold text-gray-800">R$ 9,90/mês</p>
            <p className="text-sm text-gray-600">Promoção dos primeiros 3 meses</p>
            <p className="text-xs text-gray-500">Depois R$ 17,90/mês</p>
          </div>

          <button className="w-full bg-gradient-to-r from-rose-400 to-pink-400 text-white py-4 px-6 rounded-xl font-semibold hover:from-rose-500 hover:to-pink-500 transition-all mb-3">
            Começar Teste Gratuito de 7 Dias
          </button>

          <p className="text-xs text-gray-500 text-center">
            Cancele a qualquer momento. Sem compromisso.
          </p>
        </div>
      </div>
    </div>
  )

  const renderBottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-white/20 p-4">
      <div className="max-w-md mx-auto flex justify-around">
        <button
          onClick={() => setCurrentScreen('home')}
          className={`flex flex-col items-center gap-1 ${currentScreen === 'home' ? 'text-rose-500' : 'text-gray-500'}`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-xs">Início</span>
        </button>
        
        <button
          onClick={() => setCurrentScreen('planner')}
          className={`flex flex-col items-center gap-1 ${currentScreen === 'planner' ? 'text-rose-500' : 'text-gray-500'}`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-xs">Planner</span>
        </button>
        
        <button
          onClick={() => setCurrentScreen('mood')}
          className={`flex flex-col items-center gap-1 ${currentScreen === 'mood' ? 'text-rose-500' : 'text-gray-500'}`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-xs">Humor</span>
        </button>
        
        <button
          onClick={() => setCurrentScreen('cycle')}
          className={`flex flex-col items-center gap-1 ${currentScreen === 'cycle' ? 'text-rose-500' : 'text-gray-500'}`}
        >
          <Activity className="w-5 h-5" />
          <span className="text-xs">Ciclo</span>
        </button>
        
        <button
          onClick={() => setCurrentScreen('premium')}
          className={`flex flex-col items-center gap-1 ${currentScreen === 'premium' ? 'text-rose-500' : 'text-gray-500'}`}
        >
          <Crown className="w-5 h-5" />
          <span className="text-xs">Premium</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      {currentScreen === 'login' && renderLogin()}
      {currentScreen === 'home' && renderHome()}
      {currentScreen === 'planner' && renderPlanner()}
      {currentScreen === 'mood' && renderMood()}
      {currentScreen === 'food' && renderFood()}
      {currentScreen === 'memory' && renderMemory()}
      {currentScreen === 'premium' && renderPremium()}
      {currentScreen === 'cycle' && renderCycle()}
      {currentScreen === 'shopping' && renderShopping()}
      {currentScreen === 'notifications' && renderNotifications()}
      {currentScreen !== 'login' && renderBottomNav()}
    </div>
  )
}