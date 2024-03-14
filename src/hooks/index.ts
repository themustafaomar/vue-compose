import {
  ref,
  computed,provide,
  inject,
  type Ref,
  type MaybeRef
} from 'vue'

const VUE_COMPOSE_CTX_KEY = Symbol('VComposeCtx')

export interface ComposeOptions {
  detachOnClose?: boolean
}

interface Context {
  active: Ref<boolean>
  creating: Ref<boolean>
  updating: Ref<boolean>
  data: Ref<boolean>
}

interface Registery extends Context {
  __name: string
}

type Instance = string | Context

export function useCompose(options: ComposeOptions = {}) {
  const { detachOnClose = true } = options
  const registery: Ref<Registery[]> = ref([])

  provide(VUE_COMPOSE_CTX_KEY, {
    register: (name: string, states: Context) => {
      registery.value.push({
        __name: name,
        ...states,
      })
    }
  })

  // API

  function open(name: string) {
    _setActive(_findInstance(name), true)
  }

  function close(name: string) {
    const instance = _findInstance(name)
    _setActive(instance, false)
    _setUpdating(instance)
    if (detachOnClose)
      _setData(instance)
  }

  function create(name: string, data?: any) {
    const instance = _findInstance(name)
    _setActive(instance, true)
    _setData(instance, data)
    _setUpdating(instance)
    _setCreating(instance, true)
  }

  function edit(name: string, data?: any) {
    const instance = _findInstance(name)
    _setActive(instance, true)
    _setUpdating(instance, true)
    _setData(instance, data)
    _setCreating(instance)
  }

  function toggle(name: string) {
    const instance = _findInstance(name)
    instance.active ? close(name) : open(name)
  }

  // Private

  function _setActive(instance: Instance, state: boolean = false) {
    if (instance == 'string') {
      _findInstance(instance).active = state
    } else {
      // @ts-ignore
      instance.active = state
    }
  }

  function _setUpdating(instance: Instance, state: boolean = false) {
    if (instance == 'string') {
      _findInstance(instance).updating = state
    } else {
      // @ts-ignore
      instance.updating = state
    }
  }

  function _setCreating(instance: Instance, state: boolean = false) {
    if (instance == 'string') {
      _findInstance(instance).creating = state
    } else {
      // @ts-ignore
      instance.creating = state
    }
  }

  function _setData(instance: Instance, data: any = undefined) {
    if (instance == 'string') {
      _findInstance(instance).data = data
    } else {
      // @ts-ignore
      instance.data = data
    }
  }

  function _findInstance(name: string): MaybeRef {
    return registery.value.find(({ __name }) => __name === name)
  }

  return {
    open,
    close,
    toggle,
    create,
    edit,
  }
}

export interface DefineComposeOptions {
  createTitle?: string
  updateTitle?: string
  createAction?: string
  updateAction?: string
}

interface Context {
  register: Function
}

export function defineCompose(name: string, options: DefineComposeOptions = {}) {
  const {
    createTitle = `Create %`,
    updateTitle = `Edit %`,
    createAction = 'Save',
    updateAction = 'Save changes',
  } = options
  const active = ref(false)
  const creating = ref(true)
  const updating = ref(false)
  const data = ref(null)
  const ctx = {
    active,
    creating,
    updating,
    data,
  }
  const compose = inject<Context | null>(VUE_COMPOSE_CTX_KEY, null)

  if (compose == null) {
    throw new Error('Did you use `useCompose` composable in the parent component?')
  }

  compose.register(name, ctx)

  const title = computed(() => {
    return _normalize(name, creating.value, 'title')
  })

  const action = computed(() => {
    return _normalize(name, creating.value, 'action')
  })

  // Private

  const _normalize = (module: string, creating: boolean, type: string) => {
    return (type === 'title'
      ? (creating ? createTitle : updateTitle)
      : (creating ? createAction : updateAction)).replace('%', module)
  }

  return {
    ...ctx,
    action,
    title,
  }
}
