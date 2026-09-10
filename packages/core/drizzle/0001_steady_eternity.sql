ALTER TABLE `instances` ADD COLUMN `ip_stack` text CONSTRAINT "instances_ip_stack_check" CHECK("ip_stack" in ('v4', 'v6', 'dual'));
