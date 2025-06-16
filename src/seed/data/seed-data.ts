import { ValidRoles } from "../../auth/enums/valid-roles.enum";

interface SeedUser {
    email: string;
    password: string;
    name: string;
    lastname: string;
    roles?: string[]
}

interface SeedEvent {
    name: string;
    bannerPhotoUrl: string;
    isPublic: boolean;
}
interface SeedPresentation {
    place: string;
    capacity: number;
    openDate: string;
    startDate: string;
    latitude: number;
    longitude: number;
    price: number;
    description: string;
    ticketAvailabilityDate: string;
    ticketSaleAvailabilityDate: string;
    city: string;
}


export interface SeedTickets {
    isRedeemed: boolean;
    isActive: boolean;
}

interface SeedData {
    users: SeedUser[];
    events: SeedEvent[];
    presentations: SeedPresentation[];
}

export const initialData: SeedData = {
    users: [
        {
            name: "Gustavo",
            email: "gus@gmail.com",
            password: "Hola1597!!!",
            lastname: "Gonzales"
        },
        {
            name: "Juan",
            email: "marin@gmail.com",
            password: "Hola1597!!!",
            lastname: "Marin"
        },
        {
            name: "Cristian",
            email: "guarro@gmail.com",
            password: "Hola1597!!!",
            lastname: "Botina"
        },
        {
            name: "Daniela",
            email: "dani@gmail.com",
            password: "Hola1597!!!",
            lastname: "Londoño"
        },
        {
            name: "Alejandro",
            email: "munero@gmail.com",
            password: "Hola1597!!!",
            lastname: "Muñoz"
        },
        {
            name: "David",
            email: "donney@gmail.com",
            password: "Hola1597!!!",
            lastname: "Donneys",
        },
        {
            name: "Valentina",
            email: "valentina.gonzalez3@u.icesi.edu.co",
            password: "Hola1597!!!",
            lastname: "Gonzales"
        },
        {
            name: "Alejandro",
            email: "alejolonber@gmail.com",
            password: "Hola1597!!!",
            lastname: "Londoño"
        },
        {
            name: "Miguel",
            email: "miguegon@gmail.com",
            password: "Hola1597!!!",
            lastname: "Gonzales"
        },
        {
            name: "Isabella",
            email: "isahc221024@gmail.com",
            password: "Hola1597!!!",
            lastname: "Huila"
        },
        {
            name: "Miguel",
            email: "scare@gmail.com",
            password: "Hola1597!!!",
            lastname: "Martinez"
        },
        {
            name: "Ricardo",
            email: "urbirrichie@gmail.com",
            password: "Hola1597!!!",
            lastname: "Urbina"
        },
        {
            name: "Kevin",
            email: "kika@gmail.com",
            password: "Hola1597!!!",
            lastname: "Nieto"
        },
        {
            name: "Juan",
            email: "cabezas@gmail.com",
            password: "Hola1597!!!",
            lastname: "Cabezas"
        },
        {
            name: "Nicolas",
            email: "cuellar@gmail.com",
            password: "Hola1597!!!",
            lastname: "Cuellar"
        },
        {
            name: "Isabella",
            email: "isabella.ocampo@u.icesi.edu.co",
            password: "Hola1597!!!",
            lastname: "Ocampo",
            roles: [ValidRoles.eventManager]
        },
        {
            name: "Samuel",
            email: "samubar@gmail.com",
            password: "Hola1597!!!",
            lastname: "Barrera",
            roles: [ValidRoles.eventManager]
        },
        {
            name: "Sergio",
            email: "sergio@gmail.com",
            password: "Hola1597!!!",
            lastname: "Arboleda",
            roles: [ValidRoles.eventManager]
        },
        {
            name: "Juan",
            email: "sebastian@gmail.com",
            password: "Hola1597!!!",
            lastname: "Barrera",
            roles: [ValidRoles.eventManager]
        },
        {
            name: "Juan",
            email: "colonia@gmail.com",
            password: "Hola1597!!!",
            lastname: "Colonia",
            roles: [ValidRoles.eventManager]
        },
        {
            name: "Checker",
            email: "ticketchecker@gmail.com",
            password: "Hola1597!!!",
            lastname: "Ticket",
            roles: [ValidRoles.ticketChecker]
        },
        {
            name: "Alejandro",
            email: "alejitocordoba@hotmail.com",
            password: "Hola1597!!!",
            lastname: "Cordoba",
            roles: [ValidRoles.admin]

        },

    ],

    events: [
        {
            name: "ANDRÉS CALAMARO: AGENDA 1999 TOUR",
            bannerPhotoUrl: "https://res.cloudinary.com/dnmlo67cy/image/upload/v1746554872/ltavyxu115tlpcvhjews.jpg",
            isPublic: true,
        },
        {
            name: "Debí Tirar Más Fotos World Tour",
            bannerPhotoUrl: "https://res.cloudinary.com/dnmlo67cy/image/upload/v1746655189/avljgk2jxugrtoyy1qmv.jpg",
            isPublic: true,
        },
        {
            name: "CAMILO | NUESTRO LUGAR FELIZ TOUR - CALI",
            bannerPhotoUrl: "https://res.cloudinary.com/dnmlo67cy/image/upload/v1746655493/u5dhbldu2ob7wjherfxf.jpg",
            isPublic: true,
        },
        {
            name: "REY RUIZ | SIEMPRE CONTIGO",
            bannerPhotoUrl: "https://res.cloudinary.com/dnmlo67cy/image/upload/v1746655833/wixrcw9ay0y4ilgzleqe.jpg",
            isPublic: true,
        },
        {
            name: "TRUENO",
            bannerPhotoUrl: "https://res.cloudinary.com/dnmlo67cy/image/upload/v1746656053/gwxuquxh1omlmifzh9lk.jpg",
            isPublic: true,
        }
    ],

    presentations: [
        {
            place: "Atanasio Girardot",
            capacity: 500,
            openDate: "2025-05-06T08:00:00Z",
            startDate: "2025-05-06T10:00:00Z",
            latitude: 6.25184,
            longitude: -75.56359,
            description: "A musical event in the main stadium.",
            ticketAvailabilityDate: "2025-04-20T00:00:00Z",
            ticketSaleAvailabilityDate: "2025-04-25T00:00:00Z",
            city: "Medellín",
            price: 50000
        },
        {
            place: "Auditorio Fundadores",
            capacity: 1000,
            openDate: "2025-06-01T09:00:00Z",
            startDate: "2025-06-01T11:00:00Z",
            latitude: 6.25025,
            longitude: -75.56178,
            description: "A technology conference for developers.",
            ticketAvailabilityDate: "2025-05-15T00:00:00Z",
            ticketSaleAvailabilityDate: "2025-05-20T00:00:00Z",
            city: "Medellín",
            price: 50000
        },
        {
            place: "Plaza Mayor",
            capacity: 3000,
            openDate: "2025-07-10T10:00:00Z",
            startDate: "2025-07-10T12:00:00Z",
            latitude: 6.21356,
            longitude: -75.57422,
            description: "Open-air concert featuring local bands.",
            ticketAvailabilityDate: "2025-06-01T00:00:00Z",
            ticketSaleAvailabilityDate: "2025-06-05T00:00:00Z",
            city: "Medellín",
            price: 50000
        },
        {
            place: "Teatro Metropolitano",
            capacity: 800,
            openDate: "2025-08-01T18:00:00Z",
            startDate: "2025-08-01T20:00:00Z",
            latitude: 6.24631,
            longitude: -75.57347,
            description: "Classical music concert with a full orchestra.",
            ticketAvailabilityDate: "2025-07-01T00:00:00Z",
            ticketSaleAvailabilityDate: "2025-07-10T00:00:00Z",
            city: "Medellín",
            price: 50000
        },
        {
            place: "Centro de Convenciones Plaza Mayor",
            capacity: 1500,
            openDate: "2025-06-20T08:00:00Z",
            startDate: "2025-06-20T10:00:00Z",
            latitude: 6.20993,
            longitude: -75.56692,
            description: "Business seminar on innovation and entrepreneurship.",
            ticketAvailabilityDate: "2025-06-01T00:00:00Z",
            ticketSaleAvailabilityDate: "2025-06-05T00:00:00Z",
            city: "Medellín",
            price: 50000
        },
        {
            place: "Parque Norte",
            capacity: 2000,
            openDate: "2025-09-05T14:00:00Z",
            startDate: "2025-09-05T16:00:00Z",
            latitude: 6.24114,
            longitude: -75.57142,
            description: "An outdoor family event with food trucks and entertainment.",
            ticketAvailabilityDate: "2025-08-01T00:00:00Z",
            ticketSaleAvailabilityDate: "2025-08-10T00:00:00Z",
            city: "Medellín",
            price: 50000
        },
        {
            place: "Teatro Universidad de Medellín",
            capacity: 600,
            openDate: "2025-10-01T17:00:00Z",
            startDate: "2025-10-01T19:00:00Z",
            latitude: 6.21719,
            longitude: -75.58933,
            description: "A theater performance of a famous play.",
            ticketAvailabilityDate: "2025-09-10T00:00:00Z",
            ticketSaleAvailabilityDate: "2025-09-15T00:00:00Z",
            city: "Medellín",
            price: 50000
        },
        {
            place: "Estadio Olímpico",
            capacity: 35000,
            openDate: "2025-11-10T06:00:00Z",
            startDate: "2025-11-10T08:00:00Z",
            latitude: 6.23241,
            longitude: -75.59275,
            description: "A major sports event, finals for a national league.",
            ticketAvailabilityDate: "2025-10-01T00:00:00Z",
            ticketSaleAvailabilityDate: "2025-10-05T00:00:00Z",
            city: "Medellín",
            price: 50000
        },
        {
            place: "La Macarena",
            capacity: 1200,
            openDate: "2025-12-15T20:00:00Z",
            startDate: "2025-12-15T22:00:00Z",
            latitude: 6.24795,
            longitude: -75.57183,
            description: "A comedy night featuring international comedians.",
            ticketAvailabilityDate: "2025-11-15T00:00:00Z",
            ticketSaleAvailabilityDate: "2025-11-20T00:00:00Z",
            city: "Medellín",
            price: 50000
        },
        {
            place: "Parque de los Deseos",
            capacity: 2500,
            openDate: "2025-05-20T17:00:00Z",
            startDate: "2025-05-20T19:00:00Z",
            latitude: 6.23569,
            longitude: -75.57312,
            description: "A film screening under the stars with food and drinks.",
            ticketAvailabilityDate: "2025-05-10T00:00:00Z",
            ticketSaleAvailabilityDate: "2025-05-15T00:00:00Z",
            city: "Medellín",
            price: 50000
        },
        {
            place: "Museo de Arte Moderno",
            capacity: 400,
            openDate: "2025-07-15T17:00:00Z",
            startDate: "2025-07-15T18:30:00Z",
            latitude: 6.22195,
            longitude: -75.57406,
            description: "An evening art exhibition and cultural talk.",
            ticketAvailabilityDate: "2025-06-20T00:00:00Z",
            ticketSaleAvailabilityDate: "2025-06-25T00:00:00Z",
            city: "Medellín",
            price: 50000
        },
        {
            place: "Jardín Botánico",
            capacity: 1000,
            openDate: "2025-08-12T09:00:00Z",
            startDate: "2025-08-12T10:30:00Z",
            latitude: 6.27153,
            longitude: -75.56503,
            description: "A wellness fair with workshops and nature walks.",
            ticketAvailabilityDate: "2025-07-15T00:00:00Z",
            ticketSaleAvailabilityDate: "2025-07-20T00:00:00Z",
            city: "Medellín",
            price: 50000
        },
        {
            place: "Pueblito Paisa",
            capacity: 600,
            openDate: "2025-09-10T15:00:00Z",
            startDate: "2025-09-10T17:00:00Z",
            latitude: 6.23524,
            longitude: -75.58321,
            description: "A traditional music and food celebration.",
            ticketAvailabilityDate: "2025-08-10T00:00:00Z",
            ticketSaleAvailabilityDate: "2025-08-15T00:00:00Z",
            city: "Medellín",
            price: 50000
        },
        {
            place: "Biblioteca España",
            capacity: 300,
            openDate: "2025-10-20T14:00:00Z",
            startDate: "2025-10-20T15:00:00Z",
            latitude: 6.29131,
            longitude: -75.55941,
            description: "Literary readings and a book launch event.",
            ticketAvailabilityDate: "2025-09-25T00:00:00Z",
            ticketSaleAvailabilityDate: "2025-10-01T00:00:00Z",
            city: "Medellín",
            price: 50000
        },
        {
            place: "Casa de la Música",
            capacity: 700,
            openDate: "2025-11-05T19:00:00Z",
            startDate: "2025-11-05T20:30:00Z",
            latitude: 6.27012,
            longitude: -75.56789,
            description: "Live jazz night with guest artists.",
            ticketAvailabilityDate: "2025-10-10T00:00:00Z",
            ticketSaleAvailabilityDate: "2025-10-15T00:00:00Z",
            city: "Medellín",
            price: 50000
        }
    ]
}


