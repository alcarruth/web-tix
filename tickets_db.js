// Generated by CoffeeScript 2.4.1
(function() {
  //!/usr/bin/env coffee
  // -*- coding: utf-8 -*-
  var Client, Conference, Game, Pool, Table, Table_Row, Team, Ticket, Ticket_Lot, Ticket_User, conferences, createUser, db, games, getUserByEmail, getUserByID, pool, query, tables, teams, ticket_lots, ticket_users, tickets,
    boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

  ({Table, Table_Row} = require('./db_orm'));

  ({Client, Pool} = require('pg'));

  pool = new Pool({
    host: '/var/run/postgresql',
    database: 'tickets'
  });

  query = async function(qs) {
    var client, response;
    client = (await pool.connect());
    response = client.query(qs);
    return response.then(function(result) {
      client.release();
      return result.rows;
    });
  };

  db = {
    pool: pool,
    query: query,
    tables: {}
  };

  //-------------------------------------------------------------------------
  // An instance of class Conference is kept in the conferences table

  Conference = class Conference extends Table_Row {
    constructor(row) {
      super(conferences);
      this.__init(row);
    }

  };

  conferences = new Table({
    db: db,
    tablename: 'conference',
    row_class: Conference,
    primary_key: 'abbrev_name',
    columns: ['abbrev_name', 'name', 'logo'],
    back_references: {
      teams: {
        table_name: 'team',
        col: 'conference_name'
      }
    }
  });

  
  //------------------------------------------------------------------------------------

  Team = class Team extends Table_Row {
    constructor(obj) {
      super(teams);
      this.toString = this.toString.bind(this);
      this.games = this.games.bind(this);
      this.__init(obj);
    }

    toString() {
      boundMethodCheck(this, Team);
      return this.__name;
    }

    async games() {
      var games;
      boundMethodCheck(this, Team);
      games = ((await this.away_games())).concat((await this.home_games()));
      games.sort(Game.compare);
      return games;
    }

  };

  teams = new Table({
    db: db,
    tablename: 'team',
    row_class: Team,
    primary_key: 'id',
    columns: ['id', 'name', 'nickname', 'logo', 'espn_id', 'city', 'state', 'conference_name', 'conference'],
    foreign_keys: {
      conference: {
        table_name: 'conference',
        key_name: 'conference_name'
      }
    },
    back_references: {
      home_games: {
        table_name: 'game',
        col: 'home_team_id'
      },
      away_games: {
        table_name: 'game',
        col: 'visiting_team_id'
      }
    }
  });

  
  //------------------------------------------------------------------------------------

  Game = class Game extends Table_Row {
    // class (static) method suitable for sorting games
    static compare(a, b) {
      var a_val, b_val;
      a_val = a.date().valueOf();
      b_val = b.date().valueOf();
      return (a_val < b_val ? -1 : 1);
    }

    constructor(obj) {
      super(games);
      this.toString = this.toString.bind(this);
      this.__init(obj);
    }

    async toString() {
      var date, host, visitor;
      boundMethodCheck(this, Game);
      host = (await this.home_team());
      visitor = (await this.visiting_team());
      date = this.date().toString().split(' ').slice(0, 4).join(' ');
      return `${visitor.name()} at ${host.name()} on ${date}`;
    }

  };

  games = new Table({
    db: db,
    tablename: 'game',
    row_class: Game,
    primary_key: 'id',
    columns: ['id', 'home_team_id', 'visiting_team_id', 'date'],
    foreign_keys: {
      home_team: {
        table_name: 'team',
        key_name: 'home_team_id'
      },
      visiting_team: {
        table_name: 'team',
        key_name: 'visiting_team_id'
      }
    }
  });

  //------------------------------------------------------------------------------------
  // Ticket Users

  Ticket_User = class Ticket_User extends Table_Row {
    constructor(obj) {
      super(ticket_users);
      this.toString = this.toString.bind(this);
      this.__init(obj);
    }

    toString() {
      boundMethodCheck(this, Ticket_User);
      return `${this.__name} <${this.__email}>`;
    }

  };

  ticket_users = new Table({
    db: db,
    tablename: 'ticket_user',
    row_class: Ticket_User,
    primary_key: 'id',
    columns: ['id', 'name', 'email', 'picture']
  });

  // add a user to the database

  createUser = function(user_data) {
    var email, name, picture, user;
    user = new User(name = user_data["name"], email = user_data["email"], picture = user_data["picture"]);
    ticket_users.add_row(user);
    //db_session.commit()
    return user;
  };

  // maps a user_id to a user

  getUserByID = async function(user_id) {
    var qs, result;
    qs = `select * from ticket_user where id = '${user_id}'`;
    result = (await db.pool.query(qs));
    return result.rows[0];
  };

  // lookup a user by their email address
  // and return the user id

  getUserByEmail = async function(email) {
    var qs, result;
    qs = `select * from ticket_user where email = '${email}'`;
    result = (await db.pool.query(qs));
    return result.rows[0];
  };

  //------------------------------------------------------------------------------------
  // Ticket Lots

  Ticket_Lot = class Ticket_Lot extends Table_Row {
    constructor(obj) {
      super(ticket_lots);
      this.make_img_path = this.make_img_path.bind(this);
      //return 'static/images/ticket_images/ticket_lot_%d.%s' % (@__id, img_type)
      this.num_seats = this.num_seats.bind(this);
      this.seats_str = this.seats_str.bind(this);
      //return ', '.join(map(str,@__seats()))
      this.toString = this.toString.bind(this);
      this.__init(obj);
    }

    make_img_path(img_type) {
      boundMethodCheck(this, Ticket_Lot);
    }

    num_seats() {
      boundMethodCheck(this, Ticket_Lot);
      return len(this.__tickets);
    }

    seats_str() {
      boundMethodCheck(this, Ticket_Lot);
    }

    toString() {
      boundMethodCheck(this, Ticket_Lot);
    }

  };

  //s = str(@__game)
  //s += " [sec: %d, row: %d, seats: %s]" % (@__section, @__row, @__seats())
  //s += " $%d ea" % @__price
  //return s
  ticket_lots = new Table({
    db: db,
    tablename: 'ticket_lot',
    row_class: Ticket_Lot,
    primary_key: 'id',
    columns: ['id', 'user_id', 'seller', 'game_id', 'section', 'row', 'price', 'img_path'],
    foreign_keys: {
      user: {
        table_name: 'ticket_user',
        key_name: 'user_id'
      },
      game: {
        table_name: 'game',
        key_name: 'game_id'
      }
    },
    back_references: {
      tickets: {
        table_name: 'ticket',
        key_name: 'lot_id'
      }
    }
  });

  //------------------------------------------------------------------------------------
  // Tickets

  Ticket = class Ticket extends Table_Row {
    constructor(obj) {
      super(tickets);
      this.toString = this.toString.bind(this);
      this.__init(obj);
    }

    toString() {
      boundMethodCheck(this, Ticket);
    }

  };

  //s = str(@__lot.game)
  //s += " [sec: %d, row: %d, seat: %d]" % (@__lot.section, @__lot.row, @__seat)
  //s += " $%d" % @__lot.price
  //return s
  tickets = new Table({
    db: db,
    tablename: 'ticket',
    row_class: Ticket,
    primary_key: 'id',
    columns: ['id', 'lot_id', 'seat'],
    foreign_keys: {
      lot: {
        table_name: 'ticket_lot',
        key: 'lot_id'
      }
    }
  });

  //------------------------------------------------------------------------------------

  tables = {
    conference: conferences,
    team: teams,
    game: games,
    ticket: tickets,
    ticket_user: ticket_users,
    ticket_lot: ticket_lots
  };

  exports.pool = pool;

  exports.query = query;

  exports.tables = tables;

  exports.Table = Table;

  exports.Table_Row = Table_Row;

  exports.Conference = Conference;

  exports.Team = Team;

  exports.Game = Game;

  exports.Ticket = Ticket;

  exports.Ticket_User = Ticket_User;

  exports.Ticket_Lot = Ticket_Lot;

}).call(this);
