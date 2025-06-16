User Fragment

```graphql
fragment UserFields on User {
  id
  email
  name
  lastname
  roles
}
```

```graphql
fragment TicketFields on Ticket {
  id
  buyDate
  isRedeemed
  isActive
  quantity
}

```

Event Fragment
```graphql
fragment EventFields on Event {
  id
  name
  bannerPhotoUrl
  isPublic
  user {
    id
    name
    email
  }
}
```

Presentation Fragment
```graphql
fragment PresentationFields on Presentation {
  idPresentation
  place
  capacity
  price
  startDate
  openDate
  city
  description
  latitude
  longitude
  ticketAvailabilityDate
  ticketSaleAvailabilityDate
}
```

Registro
```graphql
mutation Register {
  register(createAuthInput: {
    email: "useSSr@example.com",
    password: "Password123",
    name: "John",
    lastname: "Doe"
  }) {
    id
    email
    name
    roles
  }
}
```

Login

```graphql
mutation {
  login(loginInput: { email: "alejitocordoba@hotmail.com", password: "Hola1597!!!" }) {
    token
    user {
      id
      email
      roles
    }
  }
}
```

Registrar a un manager de eventos

```graphql
mutation RegisterEventManager {
  registerEventManager(createAuthInput: {
    email: "managers@example.com",
    password: "Manager123",
    name: "Event",
    lastname: "Manager"
  }) {
    id
    email
    roles
  }
}
```

Obtener todos los usuarios
```graphql
query GetAllUsers {
  users {
    id
    email
    name
    roles
  }
}
```
Obtener usuario

```graphql
query GetUser {
  user(findOneUserInput: { id: "102188f4-3e19-456d-85ea-2dde79de2fa2" }) {
    id
    email
    name
    roles
  }
}
```


Actualizar usuario

```graphql
mutation UpdateUser {
  updateUser(
    findOneUserInput: { id: "1bb25748-efb1-40bf-b137-7378b5d9c350" },
    updateAuthInput: { name: "Updated Name" }
  ) {
    id
    name
    email
  }
}
```


Eliminar usuario

```graphql
mutation DeleteUser {
  deleteUser(findOneUserInput: { id: "1bb25748-efb1-40bf-b137-7378b5d9c350" }) {
    message
  }
}
```

Crear evento

```graphql
mutation CreateEvent {
  createEvent(createEventInput: {
    name: "Mi Evento Increíble",
    bannerPhotoUrl: "https://ejemplo.com/banner.jpg",
    isPublic: true
  }) {
    id
    name
    bannerPhotoUrl
    isPublic
    user {
      id
      name
    }
  }
}
```

Obtener todos los eventos

```graphql
query GetAllEvents {
  findAllEvents(limit: 1, offset: 0) {
    id
    name
    bannerPhotoUrl
    isPublic
    user {
      id
      email
    }
    presentations {
      idPresentation
      place
      capacity
      price
      startDate
      city
    }
  }
}
```

Obtener mis eventos

```graphql
query GetMyEvents {
  findEventsByUser {
    id
    name
    bannerPhotoUrl
    isPublic
    presentations {
      idPresentation
      place
      capacity
      price
      startDate
      openDate
      city
      description
    }
  }
}
```


Buscar evento

```graphql
query FindEvent {
  findEvent(term: "uuid") {
    id
    name
    bannerPhotoUrl
    isPublic
    user {
      id
    }
    presentations {
      idPresentation
      place
      capacity
      price
      startDate
      city
      latitude
      longitude
      description
      ticketAvailabilityDate
      ticketSaleAvailabilityDate
    }
  }
}
```

Buscar evento sin restricciones

```graphql
query FindEventUnrestricted {
  findEventUnrestricted(term: "e8fbd141-eb75-4828-b836-eb4717873073") {
    id
    name
    bannerPhotoUrl
    isPublic
    user {
      id
      email
      name
    }
    presentations {
      idPresentation
      place
      capacity
      price
      startDate  
      city
      tickets {
        id
        buyDate
        isRedeemed
        isActive
        quantity
      }
    }
  }
}
```


Actualizar evento

```graphql
mutation UpdateEvent {
  updateEvent(id: "d644e03a-5564-4a57-87af-5739970ce426", updateEventInput: {

    name: "Evento Actualizado",
    isPublic: false
  
}) {
    id
    name
    bannerPhotoUrl
    isPublic
    user {
      id
      lastname
    }
  }
}
```