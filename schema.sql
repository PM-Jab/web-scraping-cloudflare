DROP TABLE IF EXISTS `SET100`;
CREATE TABLE IF NOT EXISTS `SET100` (
  `id` INTEGER NOT NULL,
  `symbol` varchar(255) NOT NULL UNIQUE,
  `name` varchar(255) NOT NULL,
  `main_business` text NOT NULL,
  `industry` text NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `SET100_PRICES`;
CREATE TABLE IF NOT EXISTS `SET100_PRICES` (
  `id` INTEGER NOT NULL,
  `stock_id` INTEGER  NOT NULL,
  `price` DECIMAL NOT NULL,
  `recorded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`stock_id`) REFERENCES `SET100`(`id`)
);



-- DROP idx_created_at IF EXISTS SET100_PRICE;



-- npx wrangler d1 execute SET100-prod-d1 --local --command="SELECT * FROM SET100"