# StyleRent backend — multi-stage Docker build for Render.
# Matches backend/pom.xml: Java 17, Maven, executable Spring Boot JAR.
# Render settings: Root Directory = backend, Runtime = Docker,
# Dockerfile Path = Dockerfile, Docker Command = blank.
# Required env vars on Render: DB_PASSWORD (and optionally DB_USERNAME,
# JWT_SECRET, SPRING_PROFILES_ACTIVE).

FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
