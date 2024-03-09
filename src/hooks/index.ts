import { ref, computed,provide, inject, type Ref } from 'vue'

const USE_MODAL_KEY = Symbol('ModalContext')

export interface ComposeOptions {
  detachOnClose: boolean
}

export function useCompose(options: ComposeOptions) {
  const { detachOnClose = true } = options
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

  provide(USE_MODAL_KEY, ctx)

  // API

  function open() {
    _setActive(true)
  }

  function close() {
    _setActive()
    _setUpdating()
    if (detachOnClose)
      _setData()
  }

  function create(_data: any) {
    open()
    _setData(_data)
    _setUpdating()
    creating.value = true
  }

  function edit(_data: any) {
    open()
    _setUpdating(true)
    _setData(_data)
    creating.value = false
  }

  function toggle() {
    active.value ? close() : open()
  }

  // Private

  function _setActive(state = false) {
    active.value = state
  }

  function _setUpdating(state = false) {
    updating.value = state
  }

  function _setData(_data: any = undefined) {
    data.value = _data
  }

  return {
    open,
    close,
    toggle,
    create,
    edit,
  }
}

export interface ComposeContextOptions {
  createTitle?: string
  updateTitle?: string
  createAction?: string
  updateAction?: string
}

interface Context {
  active: Ref<boolean>
  creating: Ref<boolean>
  updating: Ref<boolean>
  data: Ref<any>
}

export function useComposeContext(name: string, options: ComposeContextOptions) {
  const {
    createTitle = `Create %`,
    updateTitle = `Edit %`,
    createAction = 'Save',
    updateAction = 'Save changes',
  } = options
  const ctx = inject<Context | null>(USE_MODAL_KEY, null)

  if (ctx == null) {
    throw new Error('Did you use `useModal` composable in the parent component?')
  }

  const title = computed(() => {
    return _normalize(name, ctx.creating.value, 'title')
  })

  const action = computed(() => {
    return _normalize(name, ctx.creating.value, 'action')
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
