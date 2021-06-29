const courses = [
  {
    title: 'Curso 1',
    technology: 'Tecnología 1'
  },
  {
    title: 'Curso 2',
    technology: 'Tecnología 2'
  },
  {
    title: 'Curso 3',
    technology: 'Tecnología 3'
  },
  {
    title: 'Curso 4',
    technology: 'Tecnología 4'
  }
]

// ctx es un objeto que se comparte con todos los resolvers

const resolvers = {
  Query: {
    getCourses: (_, { input }, ctx, info) => {
    console.log("🚀 ~ ctx", ctx)
      console.log("🚀 ~ input", input)

      return courses
    },
  }
}

module.exports = resolvers