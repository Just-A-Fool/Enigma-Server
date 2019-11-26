begin;
create table if not exists users(
    id integer primary key generated by default as identity not null,
    username varchar(20) unique not null,
    password char(60) not null,
    email varchar(40) unique not null
);

create table if not exists ciphers(
    id integer primary key generated by default as identity not null,
    userid integer references users(id) on delete cascade not null,
    data text not null
);

commit;