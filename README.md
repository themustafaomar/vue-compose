# Vue Compose

This package was introduced to reduce the headache of unnecessary states by moving these states outside of the component and focus only on what the components are built for.

So what the hell does that mean in example?

Well, it means if you have a dialog/modal in your project this dialog certainly has state for opening/closing, composing the dialog title and action button, passing data when editing etc..

This package is here to make the life much easier by extracting these states, this is how.

## Installation

Follow these steps to quickly install `vue-use-compose` into your project, in this example we're using npm.

```
npm install vue-use-compose
```

## Quick Usage

Let's say we have a users list page and we have a nice button to create user and we have a child dialog, we want to open this dialog once we click the `Create user` button, let's give an example.

@/pages/users.vue

```vue
<template>
  ...
  <button @click="create">Create user</button>
  ...

  <!-- Dialog for creating or editing the users -->
  <modal />
</template>

<script setup>
import { useCompose } from 'vue-use-compose'
import Modal from './Modal.vue'

const { create } = useCompose()
</script>
```

Let's define our dialog, and get the active state from `useComposeContext` composable.

@/components/users/ManageDialog.vue

```vue
<template>
  <!-- For example we're using Vuetify dialogs -->
  <v-dialog :model-value="active">
    ...
  </v-dialog>
</template>

<script setup>
import { useComposeContext } from 'vue-use-compose'

const { active } = useComposeContext('user', {
  // 
})
</script>
```

That's it, we were able to open our dialog without the noise from the example below.

```diff
- import { ref } from 'vue'

- const isActive = ref(false)

- function setActive(state) {
-   isActive.value = state
- }

+ const { open, close } = useCompose()
```

Of course that's not everything! let's see a full example at the next section.

## Advanced Usage

The `useCompose` composable provides a set of useful functions you can use to fully control the dialog/popup/sidebar without headache.

| Function  | Description |
| ------------- | ------------- |
| `open`   | Setting `active` state with `true` |
| `close`  | Setting `active` state with `false` |
| `toggle` | Switches open and close functions |
| `create` | Setting `active` state with `true` and marks `creating` state with `true` |
| `edit`   | Setting `active` state with `true` and marks `updating` state with `true` |

@/pages/users.vue

```vue
<template>
  ...
  <button @click="create">Create user</button>
  ...

  ...
  <button @click="edit(USER_TO_EDIT)">Edit user</button>
  ...

  <!-- Dialog for creating or editing the users -->
  <modal />
</template>

<script setup>
import { useCompose } from 'vue-use-compose'
import Modal from './Modal.vue'

const { open, close, toggle, create, edit } = useCompose({
  detachOnClose: true, // Remove data when closing dialog in edit mode.
})
</script>
```

Now we can receive the payload passed to `edit` function very easily via data `ref`.

And we have access to a set of useful states we can rely on:

| State      | Description | Default |
| ---------- | ------------- | ----- |
| `active`   | Whether the it's open or closed | `false` |
| `creating` | Whether it's marked as creating | `true` |
| `updating` | Whether it's marked as updating | `false` |
| `data`     | The data that was passed to `create` or `edit` functions | `null` |
| `title`    | The composed title by default, it's composed of `Create %name` in creating and `Edit %name` in updating. | `Create %`, `Edit %` |
| `action`   | The action button of saving, by default, it's composed of `Save` in creating and `Save changes` in updating. | `Save`, `Save changes` |

@/components/users/ManageDialog.vue

```vue
<template>
  <v-dialog :model-value="active">
    <!-- prints the user, you can use this data to bind it to some form -->
    {{ data }}
  </v-dialog>
</template>

<script setup>
import { useComposeContext } from 'vue-use-compose'

const { active, creating, updating, data, title, action } = useComposeContext('user', {
  // Default options, feel free modify them, you may want to handle localization for example.
  createTitle: `Create %`,
  updateTitle: `Edit %`,
  createAction: 'Save',
  updateAction: 'Save changes',
})
</script>
```

## Licence

vuecompose is released under the MIT License.