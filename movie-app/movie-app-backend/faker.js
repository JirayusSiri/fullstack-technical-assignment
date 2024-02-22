const { faker } = require('@faker-js/faker');

// Function to generate fake movie data
function generateMovie() {
    return {
        title: faker.lorem.words({min:1, max:5}),
        description: faker.lorem.words(10),
        length: faker.number.int({ min: 60, max: 180 }),
        dateReleased: faker.date.past(),
        dateAvailableUntil: faker.date.future(),
    };
}

// Function to generate fake user data
function generateUser() {
    return {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        phoneNumber: faker.string.numeric(10)
        // phoneNumber: faker.phone.number()
    };
}

// Function to generate fake theme data
function generateWebsiteTheme() {
    return {
        name: faker.internet.color()
    };
}

// Function to generate fake genre data
function generateGenre() {
    return {
        name: faker.lorem.words()
    };
}

// Function to generate fake tag data
function generateTag() {
    return {
        name: faker.lorem.words()
    };
}

// Function to generate category data
function generateCategory() {
    return {
        name: faker.lorem.words()
    };
}

// Function to generate metadata data
function generateMetadata() {
    return {
        picture_url: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => faker.internet.url()),
        metadata_title: faker.lorem.words({min:1, max:5}),
        metadata_description: faker.lorem.words(10)
    };
}

module.exports = { generateMovie, generateUser, generateWebsiteTheme, generateGenre, generateTag, generateCategory, generateMetadata };
