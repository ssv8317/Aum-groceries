# Docker Commands for Data Persistence

## ✅ SAFE Commands (Keep Data):
```bash
# Stop containers but keep data
docker-compose stop

# Remove containers but keep volumes (data persists)
docker-compose down

# Rebuild containers but keep data
docker-compose up --build

# Rebuild with no cache but keep data
docker-compose build --no-cache
docker-compose up
```

## ❌ DANGEROUS Commands (Delete Data):
```bash
# This DELETES all data volumes
docker-compose down -v

# This DELETES all volumes
docker system prune -a --volumes

# This DELETES specific volume
docker volume rm customer-web-app_mongodb_data
```

## 🔄 Current Volumes with Data:
- customer-web-app_mongodb_data (User data)
- customer-web-app_postgresql_data (Product data)
- customer-web-app_mysql_data (Order data)
- customer-web-app_rabbitmq_data (Message queue)
- customer-web-app_consul_data (Service discovery)

## 📋 Check Current Users:
```bash
docker exec aum-mongodb mongosh -u admin -p password123 --authenticationDatabase admin aum_users --eval "db.users.find().pretty()"
```

## 🔐 Test Login with Existing Users:
1. test@example.com / password123
2. ssv1234@gmail.com / [your password]
