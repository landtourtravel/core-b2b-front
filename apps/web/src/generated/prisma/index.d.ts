
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Agencia
 * @readonly — gestionado por lt-core-admin
 */
export type Agencia = $Result.DefaultSelection<Prisma.$AgenciaPayload>
/**
 * Model UsuarioAgencia
 * @readonly — gestionado por lt-core-admin
 */
export type UsuarioAgencia = $Result.DefaultSelection<Prisma.$UsuarioAgenciaPayload>
/**
 * Model DestinoRef
 * @readonly — gestionado por lt-core-admin
 */
export type DestinoRef = $Result.DefaultSelection<Prisma.$DestinoRefPayload>
/**
 * Model PaqueteRef
 * @readonly — gestionado por lt-core-admin
 */
export type PaqueteRef = $Result.DefaultSelection<Prisma.$PaqueteRefPayload>
/**
 * Model Cliente
 * Cliente final de la agencia (el pasajero / viajero).
 * No es un User del sistema — es el cliente de la agencia minorista.
 */
export type Cliente = $Result.DefaultSelection<Prisma.$ClientePayload>
/**
 * Model Cotizacion
 * Cotización / Proforma generada por la agencia para un cliente.
 */
export type Cotizacion = $Result.DefaultSelection<Prisma.$CotizacionPayload>
/**
 * Model HistorialCotizacion
 * Auditoría de cada cambio de estado en una cotización.
 */
export type HistorialCotizacion = $Result.DefaultSelection<Prisma.$HistorialCotizacionPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const CotizacionStatus: {
  BORRADOR: 'BORRADOR',
  ENVIADA: 'ENVIADA',
  APROBADA: 'APROBADA',
  RECHAZADA: 'RECHAZADA'
};

export type CotizacionStatus = (typeof CotizacionStatus)[keyof typeof CotizacionStatus]

}

export type CotizacionStatus = $Enums.CotizacionStatus

export const CotizacionStatus: typeof $Enums.CotizacionStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Agencias
 * const agencias = await prisma.agencia.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Agencias
   * const agencias = await prisma.agencia.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.agencia`: Exposes CRUD operations for the **Agencia** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Agencias
    * const agencias = await prisma.agencia.findMany()
    * ```
    */
  get agencia(): Prisma.AgenciaDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.usuarioAgencia`: Exposes CRUD operations for the **UsuarioAgencia** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UsuarioAgencias
    * const usuarioAgencias = await prisma.usuarioAgencia.findMany()
    * ```
    */
  get usuarioAgencia(): Prisma.UsuarioAgenciaDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.destinoRef`: Exposes CRUD operations for the **DestinoRef** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DestinoRefs
    * const destinoRefs = await prisma.destinoRef.findMany()
    * ```
    */
  get destinoRef(): Prisma.DestinoRefDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.paqueteRef`: Exposes CRUD operations for the **PaqueteRef** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PaqueteRefs
    * const paqueteRefs = await prisma.paqueteRef.findMany()
    * ```
    */
  get paqueteRef(): Prisma.PaqueteRefDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.cliente`: Exposes CRUD operations for the **Cliente** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Clientes
    * const clientes = await prisma.cliente.findMany()
    * ```
    */
  get cliente(): Prisma.ClienteDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.cotizacion`: Exposes CRUD operations for the **Cotizacion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Cotizacions
    * const cotizacions = await prisma.cotizacion.findMany()
    * ```
    */
  get cotizacion(): Prisma.CotizacionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.historialCotizacion`: Exposes CRUD operations for the **HistorialCotizacion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more HistorialCotizacions
    * const historialCotizacions = await prisma.historialCotizacion.findMany()
    * ```
    */
  get historialCotizacion(): Prisma.HistorialCotizacionDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.8.0
   * Query Engine version: 3c6e192761c0362d496ed980de936e2f3cebcd3a
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Agencia: 'Agencia',
    UsuarioAgencia: 'UsuarioAgencia',
    DestinoRef: 'DestinoRef',
    PaqueteRef: 'PaqueteRef',
    Cliente: 'Cliente',
    Cotizacion: 'Cotizacion',
    HistorialCotizacion: 'HistorialCotizacion'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "agencia" | "usuarioAgencia" | "destinoRef" | "paqueteRef" | "cliente" | "cotizacion" | "historialCotizacion"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Agencia: {
        payload: Prisma.$AgenciaPayload<ExtArgs>
        fields: Prisma.AgenciaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AgenciaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgenciaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AgenciaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgenciaPayload>
          }
          findFirst: {
            args: Prisma.AgenciaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgenciaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AgenciaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgenciaPayload>
          }
          findMany: {
            args: Prisma.AgenciaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgenciaPayload>[]
          }
          create: {
            args: Prisma.AgenciaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgenciaPayload>
          }
          createMany: {
            args: Prisma.AgenciaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AgenciaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgenciaPayload>[]
          }
          delete: {
            args: Prisma.AgenciaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgenciaPayload>
          }
          update: {
            args: Prisma.AgenciaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgenciaPayload>
          }
          deleteMany: {
            args: Prisma.AgenciaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AgenciaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AgenciaUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgenciaPayload>[]
          }
          upsert: {
            args: Prisma.AgenciaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgenciaPayload>
          }
          aggregate: {
            args: Prisma.AgenciaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAgencia>
          }
          groupBy: {
            args: Prisma.AgenciaGroupByArgs<ExtArgs>
            result: $Utils.Optional<AgenciaGroupByOutputType>[]
          }
          count: {
            args: Prisma.AgenciaCountArgs<ExtArgs>
            result: $Utils.Optional<AgenciaCountAggregateOutputType> | number
          }
        }
      }
      UsuarioAgencia: {
        payload: Prisma.$UsuarioAgenciaPayload<ExtArgs>
        fields: Prisma.UsuarioAgenciaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UsuarioAgenciaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioAgenciaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UsuarioAgenciaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioAgenciaPayload>
          }
          findFirst: {
            args: Prisma.UsuarioAgenciaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioAgenciaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UsuarioAgenciaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioAgenciaPayload>
          }
          findMany: {
            args: Prisma.UsuarioAgenciaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioAgenciaPayload>[]
          }
          create: {
            args: Prisma.UsuarioAgenciaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioAgenciaPayload>
          }
          createMany: {
            args: Prisma.UsuarioAgenciaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UsuarioAgenciaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioAgenciaPayload>[]
          }
          delete: {
            args: Prisma.UsuarioAgenciaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioAgenciaPayload>
          }
          update: {
            args: Prisma.UsuarioAgenciaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioAgenciaPayload>
          }
          deleteMany: {
            args: Prisma.UsuarioAgenciaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UsuarioAgenciaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UsuarioAgenciaUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioAgenciaPayload>[]
          }
          upsert: {
            args: Prisma.UsuarioAgenciaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioAgenciaPayload>
          }
          aggregate: {
            args: Prisma.UsuarioAgenciaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUsuarioAgencia>
          }
          groupBy: {
            args: Prisma.UsuarioAgenciaGroupByArgs<ExtArgs>
            result: $Utils.Optional<UsuarioAgenciaGroupByOutputType>[]
          }
          count: {
            args: Prisma.UsuarioAgenciaCountArgs<ExtArgs>
            result: $Utils.Optional<UsuarioAgenciaCountAggregateOutputType> | number
          }
        }
      }
      DestinoRef: {
        payload: Prisma.$DestinoRefPayload<ExtArgs>
        fields: Prisma.DestinoRefFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DestinoRefFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinoRefPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DestinoRefFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinoRefPayload>
          }
          findFirst: {
            args: Prisma.DestinoRefFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinoRefPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DestinoRefFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinoRefPayload>
          }
          findMany: {
            args: Prisma.DestinoRefFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinoRefPayload>[]
          }
          create: {
            args: Prisma.DestinoRefCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinoRefPayload>
          }
          createMany: {
            args: Prisma.DestinoRefCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DestinoRefCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinoRefPayload>[]
          }
          delete: {
            args: Prisma.DestinoRefDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinoRefPayload>
          }
          update: {
            args: Prisma.DestinoRefUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinoRefPayload>
          }
          deleteMany: {
            args: Prisma.DestinoRefDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DestinoRefUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DestinoRefUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinoRefPayload>[]
          }
          upsert: {
            args: Prisma.DestinoRefUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DestinoRefPayload>
          }
          aggregate: {
            args: Prisma.DestinoRefAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDestinoRef>
          }
          groupBy: {
            args: Prisma.DestinoRefGroupByArgs<ExtArgs>
            result: $Utils.Optional<DestinoRefGroupByOutputType>[]
          }
          count: {
            args: Prisma.DestinoRefCountArgs<ExtArgs>
            result: $Utils.Optional<DestinoRefCountAggregateOutputType> | number
          }
        }
      }
      PaqueteRef: {
        payload: Prisma.$PaqueteRefPayload<ExtArgs>
        fields: Prisma.PaqueteRefFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PaqueteRefFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaqueteRefPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PaqueteRefFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaqueteRefPayload>
          }
          findFirst: {
            args: Prisma.PaqueteRefFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaqueteRefPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PaqueteRefFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaqueteRefPayload>
          }
          findMany: {
            args: Prisma.PaqueteRefFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaqueteRefPayload>[]
          }
          create: {
            args: Prisma.PaqueteRefCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaqueteRefPayload>
          }
          createMany: {
            args: Prisma.PaqueteRefCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PaqueteRefCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaqueteRefPayload>[]
          }
          delete: {
            args: Prisma.PaqueteRefDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaqueteRefPayload>
          }
          update: {
            args: Prisma.PaqueteRefUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaqueteRefPayload>
          }
          deleteMany: {
            args: Prisma.PaqueteRefDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PaqueteRefUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PaqueteRefUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaqueteRefPayload>[]
          }
          upsert: {
            args: Prisma.PaqueteRefUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PaqueteRefPayload>
          }
          aggregate: {
            args: Prisma.PaqueteRefAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePaqueteRef>
          }
          groupBy: {
            args: Prisma.PaqueteRefGroupByArgs<ExtArgs>
            result: $Utils.Optional<PaqueteRefGroupByOutputType>[]
          }
          count: {
            args: Prisma.PaqueteRefCountArgs<ExtArgs>
            result: $Utils.Optional<PaqueteRefCountAggregateOutputType> | number
          }
        }
      }
      Cliente: {
        payload: Prisma.$ClientePayload<ExtArgs>
        fields: Prisma.ClienteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ClienteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ClienteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>
          }
          findFirst: {
            args: Prisma.ClienteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ClienteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>
          }
          findMany: {
            args: Prisma.ClienteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>[]
          }
          create: {
            args: Prisma.ClienteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>
          }
          createMany: {
            args: Prisma.ClienteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ClienteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>[]
          }
          delete: {
            args: Prisma.ClienteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>
          }
          update: {
            args: Prisma.ClienteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>
          }
          deleteMany: {
            args: Prisma.ClienteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ClienteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ClienteUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>[]
          }
          upsert: {
            args: Prisma.ClienteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>
          }
          aggregate: {
            args: Prisma.ClienteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCliente>
          }
          groupBy: {
            args: Prisma.ClienteGroupByArgs<ExtArgs>
            result: $Utils.Optional<ClienteGroupByOutputType>[]
          }
          count: {
            args: Prisma.ClienteCountArgs<ExtArgs>
            result: $Utils.Optional<ClienteCountAggregateOutputType> | number
          }
        }
      }
      Cotizacion: {
        payload: Prisma.$CotizacionPayload<ExtArgs>
        fields: Prisma.CotizacionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CotizacionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CotizacionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload>
          }
          findFirst: {
            args: Prisma.CotizacionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CotizacionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload>
          }
          findMany: {
            args: Prisma.CotizacionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload>[]
          }
          create: {
            args: Prisma.CotizacionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload>
          }
          createMany: {
            args: Prisma.CotizacionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CotizacionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload>[]
          }
          delete: {
            args: Prisma.CotizacionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload>
          }
          update: {
            args: Prisma.CotizacionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload>
          }
          deleteMany: {
            args: Prisma.CotizacionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CotizacionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CotizacionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload>[]
          }
          upsert: {
            args: Prisma.CotizacionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload>
          }
          aggregate: {
            args: Prisma.CotizacionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCotizacion>
          }
          groupBy: {
            args: Prisma.CotizacionGroupByArgs<ExtArgs>
            result: $Utils.Optional<CotizacionGroupByOutputType>[]
          }
          count: {
            args: Prisma.CotizacionCountArgs<ExtArgs>
            result: $Utils.Optional<CotizacionCountAggregateOutputType> | number
          }
        }
      }
      HistorialCotizacion: {
        payload: Prisma.$HistorialCotizacionPayload<ExtArgs>
        fields: Prisma.HistorialCotizacionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.HistorialCotizacionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HistorialCotizacionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.HistorialCotizacionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HistorialCotizacionPayload>
          }
          findFirst: {
            args: Prisma.HistorialCotizacionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HistorialCotizacionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.HistorialCotizacionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HistorialCotizacionPayload>
          }
          findMany: {
            args: Prisma.HistorialCotizacionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HistorialCotizacionPayload>[]
          }
          create: {
            args: Prisma.HistorialCotizacionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HistorialCotizacionPayload>
          }
          createMany: {
            args: Prisma.HistorialCotizacionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.HistorialCotizacionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HistorialCotizacionPayload>[]
          }
          delete: {
            args: Prisma.HistorialCotizacionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HistorialCotizacionPayload>
          }
          update: {
            args: Prisma.HistorialCotizacionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HistorialCotizacionPayload>
          }
          deleteMany: {
            args: Prisma.HistorialCotizacionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.HistorialCotizacionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.HistorialCotizacionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HistorialCotizacionPayload>[]
          }
          upsert: {
            args: Prisma.HistorialCotizacionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HistorialCotizacionPayload>
          }
          aggregate: {
            args: Prisma.HistorialCotizacionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateHistorialCotizacion>
          }
          groupBy: {
            args: Prisma.HistorialCotizacionGroupByArgs<ExtArgs>
            result: $Utils.Optional<HistorialCotizacionGroupByOutputType>[]
          }
          count: {
            args: Prisma.HistorialCotizacionCountArgs<ExtArgs>
            result: $Utils.Optional<HistorialCotizacionCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    agencia?: AgenciaOmit
    usuarioAgencia?: UsuarioAgenciaOmit
    destinoRef?: DestinoRefOmit
    paqueteRef?: PaqueteRefOmit
    cliente?: ClienteOmit
    cotizacion?: CotizacionOmit
    historialCotizacion?: HistorialCotizacionOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type AgenciaCountOutputType
   */

  export type AgenciaCountOutputType = {
    usuarios: number
    clientes: number
    cotizaciones: number
  }

  export type AgenciaCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuarios?: boolean | AgenciaCountOutputTypeCountUsuariosArgs
    clientes?: boolean | AgenciaCountOutputTypeCountClientesArgs
    cotizaciones?: boolean | AgenciaCountOutputTypeCountCotizacionesArgs
  }

  // Custom InputTypes
  /**
   * AgenciaCountOutputType without action
   */
  export type AgenciaCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AgenciaCountOutputType
     */
    select?: AgenciaCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AgenciaCountOutputType without action
   */
  export type AgenciaCountOutputTypeCountUsuariosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UsuarioAgenciaWhereInput
  }

  /**
   * AgenciaCountOutputType without action
   */
  export type AgenciaCountOutputTypeCountClientesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClienteWhereInput
  }

  /**
   * AgenciaCountOutputType without action
   */
  export type AgenciaCountOutputTypeCountCotizacionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CotizacionWhereInput
  }


  /**
   * Count Type UsuarioAgenciaCountOutputType
   */

  export type UsuarioAgenciaCountOutputType = {
    cotizaciones: number
    historialCambios: number
  }

  export type UsuarioAgenciaCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cotizaciones?: boolean | UsuarioAgenciaCountOutputTypeCountCotizacionesArgs
    historialCambios?: boolean | UsuarioAgenciaCountOutputTypeCountHistorialCambiosArgs
  }

  // Custom InputTypes
  /**
   * UsuarioAgenciaCountOutputType without action
   */
  export type UsuarioAgenciaCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsuarioAgenciaCountOutputType
     */
    select?: UsuarioAgenciaCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UsuarioAgenciaCountOutputType without action
   */
  export type UsuarioAgenciaCountOutputTypeCountCotizacionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CotizacionWhereInput
  }

  /**
   * UsuarioAgenciaCountOutputType without action
   */
  export type UsuarioAgenciaCountOutputTypeCountHistorialCambiosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HistorialCotizacionWhereInput
  }


  /**
   * Count Type DestinoRefCountOutputType
   */

  export type DestinoRefCountOutputType = {
    paquetes: number
  }

  export type DestinoRefCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    paquetes?: boolean | DestinoRefCountOutputTypeCountPaquetesArgs
  }

  // Custom InputTypes
  /**
   * DestinoRefCountOutputType without action
   */
  export type DestinoRefCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinoRefCountOutputType
     */
    select?: DestinoRefCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DestinoRefCountOutputType without action
   */
  export type DestinoRefCountOutputTypeCountPaquetesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PaqueteRefWhereInput
  }


  /**
   * Count Type PaqueteRefCountOutputType
   */

  export type PaqueteRefCountOutputType = {
    cotizaciones: number
  }

  export type PaqueteRefCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cotizaciones?: boolean | PaqueteRefCountOutputTypeCountCotizacionesArgs
  }

  // Custom InputTypes
  /**
   * PaqueteRefCountOutputType without action
   */
  export type PaqueteRefCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PaqueteRefCountOutputType
     */
    select?: PaqueteRefCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PaqueteRefCountOutputType without action
   */
  export type PaqueteRefCountOutputTypeCountCotizacionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CotizacionWhereInput
  }


  /**
   * Count Type ClienteCountOutputType
   */

  export type ClienteCountOutputType = {
    cotizaciones: number
  }

  export type ClienteCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cotizaciones?: boolean | ClienteCountOutputTypeCountCotizacionesArgs
  }

  // Custom InputTypes
  /**
   * ClienteCountOutputType without action
   */
  export type ClienteCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClienteCountOutputType
     */
    select?: ClienteCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ClienteCountOutputType without action
   */
  export type ClienteCountOutputTypeCountCotizacionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CotizacionWhereInput
  }


  /**
   * Count Type CotizacionCountOutputType
   */

  export type CotizacionCountOutputType = {
    historial: number
  }

  export type CotizacionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    historial?: boolean | CotizacionCountOutputTypeCountHistorialArgs
  }

  // Custom InputTypes
  /**
   * CotizacionCountOutputType without action
   */
  export type CotizacionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CotizacionCountOutputType
     */
    select?: CotizacionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CotizacionCountOutputType without action
   */
  export type CotizacionCountOutputTypeCountHistorialArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HistorialCotizacionWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Agencia
   */

  export type AggregateAgencia = {
    _count: AgenciaCountAggregateOutputType | null
    _min: AgenciaMinAggregateOutputType | null
    _max: AgenciaMaxAggregateOutputType | null
  }

  export type AgenciaMinAggregateOutputType = {
    id: string | null
    nombre: string | null
    correo: string | null
    telefono: string | null
  }

  export type AgenciaMaxAggregateOutputType = {
    id: string | null
    nombre: string | null
    correo: string | null
    telefono: string | null
  }

  export type AgenciaCountAggregateOutputType = {
    id: number
    nombre: number
    correo: number
    telefono: number
    _all: number
  }


  export type AgenciaMinAggregateInputType = {
    id?: true
    nombre?: true
    correo?: true
    telefono?: true
  }

  export type AgenciaMaxAggregateInputType = {
    id?: true
    nombre?: true
    correo?: true
    telefono?: true
  }

  export type AgenciaCountAggregateInputType = {
    id?: true
    nombre?: true
    correo?: true
    telefono?: true
    _all?: true
  }

  export type AgenciaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Agencia to aggregate.
     */
    where?: AgenciaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Agencias to fetch.
     */
    orderBy?: AgenciaOrderByWithRelationInput | AgenciaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AgenciaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Agencias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Agencias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Agencias
    **/
    _count?: true | AgenciaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AgenciaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AgenciaMaxAggregateInputType
  }

  export type GetAgenciaAggregateType<T extends AgenciaAggregateArgs> = {
        [P in keyof T & keyof AggregateAgencia]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAgencia[P]>
      : GetScalarType<T[P], AggregateAgencia[P]>
  }




  export type AgenciaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgenciaWhereInput
    orderBy?: AgenciaOrderByWithAggregationInput | AgenciaOrderByWithAggregationInput[]
    by: AgenciaScalarFieldEnum[] | AgenciaScalarFieldEnum
    having?: AgenciaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AgenciaCountAggregateInputType | true
    _min?: AgenciaMinAggregateInputType
    _max?: AgenciaMaxAggregateInputType
  }

  export type AgenciaGroupByOutputType = {
    id: string
    nombre: string
    correo: string | null
    telefono: string | null
    _count: AgenciaCountAggregateOutputType | null
    _min: AgenciaMinAggregateOutputType | null
    _max: AgenciaMaxAggregateOutputType | null
  }

  type GetAgenciaGroupByPayload<T extends AgenciaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AgenciaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AgenciaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AgenciaGroupByOutputType[P]>
            : GetScalarType<T[P], AgenciaGroupByOutputType[P]>
        }
      >
    >


  export type AgenciaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombre?: boolean
    correo?: boolean
    telefono?: boolean
    usuarios?: boolean | Agencia$usuariosArgs<ExtArgs>
    clientes?: boolean | Agencia$clientesArgs<ExtArgs>
    cotizaciones?: boolean | Agencia$cotizacionesArgs<ExtArgs>
    _count?: boolean | AgenciaCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["agencia"]>

  export type AgenciaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombre?: boolean
    correo?: boolean
    telefono?: boolean
  }, ExtArgs["result"]["agencia"]>

  export type AgenciaSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombre?: boolean
    correo?: boolean
    telefono?: boolean
  }, ExtArgs["result"]["agencia"]>

  export type AgenciaSelectScalar = {
    id?: boolean
    nombre?: boolean
    correo?: boolean
    telefono?: boolean
  }

  export type AgenciaOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "nombre" | "correo" | "telefono", ExtArgs["result"]["agencia"]>
  export type AgenciaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuarios?: boolean | Agencia$usuariosArgs<ExtArgs>
    clientes?: boolean | Agencia$clientesArgs<ExtArgs>
    cotizaciones?: boolean | Agencia$cotizacionesArgs<ExtArgs>
    _count?: boolean | AgenciaCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AgenciaIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type AgenciaIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $AgenciaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Agencia"
    objects: {
      usuarios: Prisma.$UsuarioAgenciaPayload<ExtArgs>[]
      clientes: Prisma.$ClientePayload<ExtArgs>[]
      cotizaciones: Prisma.$CotizacionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      nombre: string
      correo: string | null
      telefono: string | null
    }, ExtArgs["result"]["agencia"]>
    composites: {}
  }

  type AgenciaGetPayload<S extends boolean | null | undefined | AgenciaDefaultArgs> = $Result.GetResult<Prisma.$AgenciaPayload, S>

  type AgenciaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AgenciaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AgenciaCountAggregateInputType | true
    }

  export interface AgenciaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Agencia'], meta: { name: 'Agencia' } }
    /**
     * Find zero or one Agencia that matches the filter.
     * @param {AgenciaFindUniqueArgs} args - Arguments to find a Agencia
     * @example
     * // Get one Agencia
     * const agencia = await prisma.agencia.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AgenciaFindUniqueArgs>(args: SelectSubset<T, AgenciaFindUniqueArgs<ExtArgs>>): Prisma__AgenciaClient<$Result.GetResult<Prisma.$AgenciaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Agencia that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AgenciaFindUniqueOrThrowArgs} args - Arguments to find a Agencia
     * @example
     * // Get one Agencia
     * const agencia = await prisma.agencia.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AgenciaFindUniqueOrThrowArgs>(args: SelectSubset<T, AgenciaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AgenciaClient<$Result.GetResult<Prisma.$AgenciaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Agencia that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgenciaFindFirstArgs} args - Arguments to find a Agencia
     * @example
     * // Get one Agencia
     * const agencia = await prisma.agencia.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AgenciaFindFirstArgs>(args?: SelectSubset<T, AgenciaFindFirstArgs<ExtArgs>>): Prisma__AgenciaClient<$Result.GetResult<Prisma.$AgenciaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Agencia that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgenciaFindFirstOrThrowArgs} args - Arguments to find a Agencia
     * @example
     * // Get one Agencia
     * const agencia = await prisma.agencia.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AgenciaFindFirstOrThrowArgs>(args?: SelectSubset<T, AgenciaFindFirstOrThrowArgs<ExtArgs>>): Prisma__AgenciaClient<$Result.GetResult<Prisma.$AgenciaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Agencias that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgenciaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Agencias
     * const agencias = await prisma.agencia.findMany()
     * 
     * // Get first 10 Agencias
     * const agencias = await prisma.agencia.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const agenciaWithIdOnly = await prisma.agencia.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AgenciaFindManyArgs>(args?: SelectSubset<T, AgenciaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgenciaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Agencia.
     * @param {AgenciaCreateArgs} args - Arguments to create a Agencia.
     * @example
     * // Create one Agencia
     * const Agencia = await prisma.agencia.create({
     *   data: {
     *     // ... data to create a Agencia
     *   }
     * })
     * 
     */
    create<T extends AgenciaCreateArgs>(args: SelectSubset<T, AgenciaCreateArgs<ExtArgs>>): Prisma__AgenciaClient<$Result.GetResult<Prisma.$AgenciaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Agencias.
     * @param {AgenciaCreateManyArgs} args - Arguments to create many Agencias.
     * @example
     * // Create many Agencias
     * const agencia = await prisma.agencia.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AgenciaCreateManyArgs>(args?: SelectSubset<T, AgenciaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Agencias and returns the data saved in the database.
     * @param {AgenciaCreateManyAndReturnArgs} args - Arguments to create many Agencias.
     * @example
     * // Create many Agencias
     * const agencia = await prisma.agencia.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Agencias and only return the `id`
     * const agenciaWithIdOnly = await prisma.agencia.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AgenciaCreateManyAndReturnArgs>(args?: SelectSubset<T, AgenciaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgenciaPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Agencia.
     * @param {AgenciaDeleteArgs} args - Arguments to delete one Agencia.
     * @example
     * // Delete one Agencia
     * const Agencia = await prisma.agencia.delete({
     *   where: {
     *     // ... filter to delete one Agencia
     *   }
     * })
     * 
     */
    delete<T extends AgenciaDeleteArgs>(args: SelectSubset<T, AgenciaDeleteArgs<ExtArgs>>): Prisma__AgenciaClient<$Result.GetResult<Prisma.$AgenciaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Agencia.
     * @param {AgenciaUpdateArgs} args - Arguments to update one Agencia.
     * @example
     * // Update one Agencia
     * const agencia = await prisma.agencia.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AgenciaUpdateArgs>(args: SelectSubset<T, AgenciaUpdateArgs<ExtArgs>>): Prisma__AgenciaClient<$Result.GetResult<Prisma.$AgenciaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Agencias.
     * @param {AgenciaDeleteManyArgs} args - Arguments to filter Agencias to delete.
     * @example
     * // Delete a few Agencias
     * const { count } = await prisma.agencia.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AgenciaDeleteManyArgs>(args?: SelectSubset<T, AgenciaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Agencias.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgenciaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Agencias
     * const agencia = await prisma.agencia.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AgenciaUpdateManyArgs>(args: SelectSubset<T, AgenciaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Agencias and returns the data updated in the database.
     * @param {AgenciaUpdateManyAndReturnArgs} args - Arguments to update many Agencias.
     * @example
     * // Update many Agencias
     * const agencia = await prisma.agencia.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Agencias and only return the `id`
     * const agenciaWithIdOnly = await prisma.agencia.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AgenciaUpdateManyAndReturnArgs>(args: SelectSubset<T, AgenciaUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgenciaPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Agencia.
     * @param {AgenciaUpsertArgs} args - Arguments to update or create a Agencia.
     * @example
     * // Update or create a Agencia
     * const agencia = await prisma.agencia.upsert({
     *   create: {
     *     // ... data to create a Agencia
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Agencia we want to update
     *   }
     * })
     */
    upsert<T extends AgenciaUpsertArgs>(args: SelectSubset<T, AgenciaUpsertArgs<ExtArgs>>): Prisma__AgenciaClient<$Result.GetResult<Prisma.$AgenciaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Agencias.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgenciaCountArgs} args - Arguments to filter Agencias to count.
     * @example
     * // Count the number of Agencias
     * const count = await prisma.agencia.count({
     *   where: {
     *     // ... the filter for the Agencias we want to count
     *   }
     * })
    **/
    count<T extends AgenciaCountArgs>(
      args?: Subset<T, AgenciaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AgenciaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Agencia.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgenciaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AgenciaAggregateArgs>(args: Subset<T, AgenciaAggregateArgs>): Prisma.PrismaPromise<GetAgenciaAggregateType<T>>

    /**
     * Group by Agencia.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgenciaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AgenciaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AgenciaGroupByArgs['orderBy'] }
        : { orderBy?: AgenciaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AgenciaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAgenciaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Agencia model
   */
  readonly fields: AgenciaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Agencia.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AgenciaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    usuarios<T extends Agencia$usuariosArgs<ExtArgs> = {}>(args?: Subset<T, Agencia$usuariosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsuarioAgenciaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    clientes<T extends Agencia$clientesArgs<ExtArgs> = {}>(args?: Subset<T, Agencia$clientesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    cotizaciones<T extends Agencia$cotizacionesArgs<ExtArgs> = {}>(args?: Subset<T, Agencia$cotizacionesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Agencia model
   */
  interface AgenciaFieldRefs {
    readonly id: FieldRef<"Agencia", 'String'>
    readonly nombre: FieldRef<"Agencia", 'String'>
    readonly correo: FieldRef<"Agencia", 'String'>
    readonly telefono: FieldRef<"Agencia", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Agencia findUnique
   */
  export type AgenciaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agencia
     */
    select?: AgenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agencia
     */
    omit?: AgenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgenciaInclude<ExtArgs> | null
    /**
     * Filter, which Agencia to fetch.
     */
    where: AgenciaWhereUniqueInput
  }

  /**
   * Agencia findUniqueOrThrow
   */
  export type AgenciaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agencia
     */
    select?: AgenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agencia
     */
    omit?: AgenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgenciaInclude<ExtArgs> | null
    /**
     * Filter, which Agencia to fetch.
     */
    where: AgenciaWhereUniqueInput
  }

  /**
   * Agencia findFirst
   */
  export type AgenciaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agencia
     */
    select?: AgenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agencia
     */
    omit?: AgenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgenciaInclude<ExtArgs> | null
    /**
     * Filter, which Agencia to fetch.
     */
    where?: AgenciaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Agencias to fetch.
     */
    orderBy?: AgenciaOrderByWithRelationInput | AgenciaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Agencias.
     */
    cursor?: AgenciaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Agencias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Agencias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Agencias.
     */
    distinct?: AgenciaScalarFieldEnum | AgenciaScalarFieldEnum[]
  }

  /**
   * Agencia findFirstOrThrow
   */
  export type AgenciaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agencia
     */
    select?: AgenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agencia
     */
    omit?: AgenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgenciaInclude<ExtArgs> | null
    /**
     * Filter, which Agencia to fetch.
     */
    where?: AgenciaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Agencias to fetch.
     */
    orderBy?: AgenciaOrderByWithRelationInput | AgenciaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Agencias.
     */
    cursor?: AgenciaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Agencias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Agencias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Agencias.
     */
    distinct?: AgenciaScalarFieldEnum | AgenciaScalarFieldEnum[]
  }

  /**
   * Agencia findMany
   */
  export type AgenciaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agencia
     */
    select?: AgenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agencia
     */
    omit?: AgenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgenciaInclude<ExtArgs> | null
    /**
     * Filter, which Agencias to fetch.
     */
    where?: AgenciaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Agencias to fetch.
     */
    orderBy?: AgenciaOrderByWithRelationInput | AgenciaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Agencias.
     */
    cursor?: AgenciaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Agencias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Agencias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Agencias.
     */
    distinct?: AgenciaScalarFieldEnum | AgenciaScalarFieldEnum[]
  }

  /**
   * Agencia create
   */
  export type AgenciaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agencia
     */
    select?: AgenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agencia
     */
    omit?: AgenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgenciaInclude<ExtArgs> | null
    /**
     * The data needed to create a Agencia.
     */
    data: XOR<AgenciaCreateInput, AgenciaUncheckedCreateInput>
  }

  /**
   * Agencia createMany
   */
  export type AgenciaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Agencias.
     */
    data: AgenciaCreateManyInput | AgenciaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Agencia createManyAndReturn
   */
  export type AgenciaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agencia
     */
    select?: AgenciaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Agencia
     */
    omit?: AgenciaOmit<ExtArgs> | null
    /**
     * The data used to create many Agencias.
     */
    data: AgenciaCreateManyInput | AgenciaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Agencia update
   */
  export type AgenciaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agencia
     */
    select?: AgenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agencia
     */
    omit?: AgenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgenciaInclude<ExtArgs> | null
    /**
     * The data needed to update a Agencia.
     */
    data: XOR<AgenciaUpdateInput, AgenciaUncheckedUpdateInput>
    /**
     * Choose, which Agencia to update.
     */
    where: AgenciaWhereUniqueInput
  }

  /**
   * Agencia updateMany
   */
  export type AgenciaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Agencias.
     */
    data: XOR<AgenciaUpdateManyMutationInput, AgenciaUncheckedUpdateManyInput>
    /**
     * Filter which Agencias to update
     */
    where?: AgenciaWhereInput
    /**
     * Limit how many Agencias to update.
     */
    limit?: number
  }

  /**
   * Agencia updateManyAndReturn
   */
  export type AgenciaUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agencia
     */
    select?: AgenciaSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Agencia
     */
    omit?: AgenciaOmit<ExtArgs> | null
    /**
     * The data used to update Agencias.
     */
    data: XOR<AgenciaUpdateManyMutationInput, AgenciaUncheckedUpdateManyInput>
    /**
     * Filter which Agencias to update
     */
    where?: AgenciaWhereInput
    /**
     * Limit how many Agencias to update.
     */
    limit?: number
  }

  /**
   * Agencia upsert
   */
  export type AgenciaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agencia
     */
    select?: AgenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agencia
     */
    omit?: AgenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgenciaInclude<ExtArgs> | null
    /**
     * The filter to search for the Agencia to update in case it exists.
     */
    where: AgenciaWhereUniqueInput
    /**
     * In case the Agencia found by the `where` argument doesn't exist, create a new Agencia with this data.
     */
    create: XOR<AgenciaCreateInput, AgenciaUncheckedCreateInput>
    /**
     * In case the Agencia was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AgenciaUpdateInput, AgenciaUncheckedUpdateInput>
  }

  /**
   * Agencia delete
   */
  export type AgenciaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agencia
     */
    select?: AgenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agencia
     */
    omit?: AgenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgenciaInclude<ExtArgs> | null
    /**
     * Filter which Agencia to delete.
     */
    where: AgenciaWhereUniqueInput
  }

  /**
   * Agencia deleteMany
   */
  export type AgenciaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Agencias to delete
     */
    where?: AgenciaWhereInput
    /**
     * Limit how many Agencias to delete.
     */
    limit?: number
  }

  /**
   * Agencia.usuarios
   */
  export type Agencia$usuariosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsuarioAgencia
     */
    select?: UsuarioAgenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsuarioAgencia
     */
    omit?: UsuarioAgenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioAgenciaInclude<ExtArgs> | null
    where?: UsuarioAgenciaWhereInput
    orderBy?: UsuarioAgenciaOrderByWithRelationInput | UsuarioAgenciaOrderByWithRelationInput[]
    cursor?: UsuarioAgenciaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UsuarioAgenciaScalarFieldEnum | UsuarioAgenciaScalarFieldEnum[]
  }

  /**
   * Agencia.clientes
   */
  export type Agencia$clientesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    where?: ClienteWhereInput
    orderBy?: ClienteOrderByWithRelationInput | ClienteOrderByWithRelationInput[]
    cursor?: ClienteWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ClienteScalarFieldEnum | ClienteScalarFieldEnum[]
  }

  /**
   * Agencia.cotizaciones
   */
  export type Agencia$cotizacionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cotizacion
     */
    omit?: CotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    where?: CotizacionWhereInput
    orderBy?: CotizacionOrderByWithRelationInput | CotizacionOrderByWithRelationInput[]
    cursor?: CotizacionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CotizacionScalarFieldEnum | CotizacionScalarFieldEnum[]
  }

  /**
   * Agencia without action
   */
  export type AgenciaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agencia
     */
    select?: AgenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agencia
     */
    omit?: AgenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgenciaInclude<ExtArgs> | null
  }


  /**
   * Model UsuarioAgencia
   */

  export type AggregateUsuarioAgencia = {
    _count: UsuarioAgenciaCountAggregateOutputType | null
    _min: UsuarioAgenciaMinAggregateOutputType | null
    _max: UsuarioAgenciaMaxAggregateOutputType | null
  }

  export type UsuarioAgenciaMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password: string | null
    role: string | null
    agenciaId: string | null
  }

  export type UsuarioAgenciaMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password: string | null
    role: string | null
    agenciaId: string | null
  }

  export type UsuarioAgenciaCountAggregateOutputType = {
    id: number
    name: number
    email: number
    password: number
    role: number
    agenciaId: number
    _all: number
  }


  export type UsuarioAgenciaMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    role?: true
    agenciaId?: true
  }

  export type UsuarioAgenciaMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    role?: true
    agenciaId?: true
  }

  export type UsuarioAgenciaCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    role?: true
    agenciaId?: true
    _all?: true
  }

  export type UsuarioAgenciaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UsuarioAgencia to aggregate.
     */
    where?: UsuarioAgenciaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UsuarioAgencias to fetch.
     */
    orderBy?: UsuarioAgenciaOrderByWithRelationInput | UsuarioAgenciaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UsuarioAgenciaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UsuarioAgencias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UsuarioAgencias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UsuarioAgencias
    **/
    _count?: true | UsuarioAgenciaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UsuarioAgenciaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UsuarioAgenciaMaxAggregateInputType
  }

  export type GetUsuarioAgenciaAggregateType<T extends UsuarioAgenciaAggregateArgs> = {
        [P in keyof T & keyof AggregateUsuarioAgencia]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUsuarioAgencia[P]>
      : GetScalarType<T[P], AggregateUsuarioAgencia[P]>
  }




  export type UsuarioAgenciaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UsuarioAgenciaWhereInput
    orderBy?: UsuarioAgenciaOrderByWithAggregationInput | UsuarioAgenciaOrderByWithAggregationInput[]
    by: UsuarioAgenciaScalarFieldEnum[] | UsuarioAgenciaScalarFieldEnum
    having?: UsuarioAgenciaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UsuarioAgenciaCountAggregateInputType | true
    _min?: UsuarioAgenciaMinAggregateInputType
    _max?: UsuarioAgenciaMaxAggregateInputType
  }

  export type UsuarioAgenciaGroupByOutputType = {
    id: string
    name: string | null
    email: string | null
    password: string | null
    role: string
    agenciaId: string | null
    _count: UsuarioAgenciaCountAggregateOutputType | null
    _min: UsuarioAgenciaMinAggregateOutputType | null
    _max: UsuarioAgenciaMaxAggregateOutputType | null
  }

  type GetUsuarioAgenciaGroupByPayload<T extends UsuarioAgenciaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UsuarioAgenciaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UsuarioAgenciaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UsuarioAgenciaGroupByOutputType[P]>
            : GetScalarType<T[P], UsuarioAgenciaGroupByOutputType[P]>
        }
      >
    >


  export type UsuarioAgenciaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    agenciaId?: boolean
    agencia?: boolean | UsuarioAgencia$agenciaArgs<ExtArgs>
    cotizaciones?: boolean | UsuarioAgencia$cotizacionesArgs<ExtArgs>
    historialCambios?: boolean | UsuarioAgencia$historialCambiosArgs<ExtArgs>
    _count?: boolean | UsuarioAgenciaCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["usuarioAgencia"]>

  export type UsuarioAgenciaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    agenciaId?: boolean
    agencia?: boolean | UsuarioAgencia$agenciaArgs<ExtArgs>
  }, ExtArgs["result"]["usuarioAgencia"]>

  export type UsuarioAgenciaSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    agenciaId?: boolean
    agencia?: boolean | UsuarioAgencia$agenciaArgs<ExtArgs>
  }, ExtArgs["result"]["usuarioAgencia"]>

  export type UsuarioAgenciaSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    agenciaId?: boolean
  }

  export type UsuarioAgenciaOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "email" | "password" | "role" | "agenciaId", ExtArgs["result"]["usuarioAgencia"]>
  export type UsuarioAgenciaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    agencia?: boolean | UsuarioAgencia$agenciaArgs<ExtArgs>
    cotizaciones?: boolean | UsuarioAgencia$cotizacionesArgs<ExtArgs>
    historialCambios?: boolean | UsuarioAgencia$historialCambiosArgs<ExtArgs>
    _count?: boolean | UsuarioAgenciaCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UsuarioAgenciaIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    agencia?: boolean | UsuarioAgencia$agenciaArgs<ExtArgs>
  }
  export type UsuarioAgenciaIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    agencia?: boolean | UsuarioAgencia$agenciaArgs<ExtArgs>
  }

  export type $UsuarioAgenciaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UsuarioAgencia"
    objects: {
      agencia: Prisma.$AgenciaPayload<ExtArgs> | null
      cotizaciones: Prisma.$CotizacionPayload<ExtArgs>[]
      historialCambios: Prisma.$HistorialCotizacionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string | null
      email: string | null
      password: string | null
      role: string
      agenciaId: string | null
    }, ExtArgs["result"]["usuarioAgencia"]>
    composites: {}
  }

  type UsuarioAgenciaGetPayload<S extends boolean | null | undefined | UsuarioAgenciaDefaultArgs> = $Result.GetResult<Prisma.$UsuarioAgenciaPayload, S>

  type UsuarioAgenciaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UsuarioAgenciaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UsuarioAgenciaCountAggregateInputType | true
    }

  export interface UsuarioAgenciaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UsuarioAgencia'], meta: { name: 'UsuarioAgencia' } }
    /**
     * Find zero or one UsuarioAgencia that matches the filter.
     * @param {UsuarioAgenciaFindUniqueArgs} args - Arguments to find a UsuarioAgencia
     * @example
     * // Get one UsuarioAgencia
     * const usuarioAgencia = await prisma.usuarioAgencia.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UsuarioAgenciaFindUniqueArgs>(args: SelectSubset<T, UsuarioAgenciaFindUniqueArgs<ExtArgs>>): Prisma__UsuarioAgenciaClient<$Result.GetResult<Prisma.$UsuarioAgenciaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UsuarioAgencia that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UsuarioAgenciaFindUniqueOrThrowArgs} args - Arguments to find a UsuarioAgencia
     * @example
     * // Get one UsuarioAgencia
     * const usuarioAgencia = await prisma.usuarioAgencia.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UsuarioAgenciaFindUniqueOrThrowArgs>(args: SelectSubset<T, UsuarioAgenciaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UsuarioAgenciaClient<$Result.GetResult<Prisma.$UsuarioAgenciaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UsuarioAgencia that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioAgenciaFindFirstArgs} args - Arguments to find a UsuarioAgencia
     * @example
     * // Get one UsuarioAgencia
     * const usuarioAgencia = await prisma.usuarioAgencia.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UsuarioAgenciaFindFirstArgs>(args?: SelectSubset<T, UsuarioAgenciaFindFirstArgs<ExtArgs>>): Prisma__UsuarioAgenciaClient<$Result.GetResult<Prisma.$UsuarioAgenciaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UsuarioAgencia that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioAgenciaFindFirstOrThrowArgs} args - Arguments to find a UsuarioAgencia
     * @example
     * // Get one UsuarioAgencia
     * const usuarioAgencia = await prisma.usuarioAgencia.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UsuarioAgenciaFindFirstOrThrowArgs>(args?: SelectSubset<T, UsuarioAgenciaFindFirstOrThrowArgs<ExtArgs>>): Prisma__UsuarioAgenciaClient<$Result.GetResult<Prisma.$UsuarioAgenciaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UsuarioAgencias that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioAgenciaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UsuarioAgencias
     * const usuarioAgencias = await prisma.usuarioAgencia.findMany()
     * 
     * // Get first 10 UsuarioAgencias
     * const usuarioAgencias = await prisma.usuarioAgencia.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const usuarioAgenciaWithIdOnly = await prisma.usuarioAgencia.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UsuarioAgenciaFindManyArgs>(args?: SelectSubset<T, UsuarioAgenciaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsuarioAgenciaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UsuarioAgencia.
     * @param {UsuarioAgenciaCreateArgs} args - Arguments to create a UsuarioAgencia.
     * @example
     * // Create one UsuarioAgencia
     * const UsuarioAgencia = await prisma.usuarioAgencia.create({
     *   data: {
     *     // ... data to create a UsuarioAgencia
     *   }
     * })
     * 
     */
    create<T extends UsuarioAgenciaCreateArgs>(args: SelectSubset<T, UsuarioAgenciaCreateArgs<ExtArgs>>): Prisma__UsuarioAgenciaClient<$Result.GetResult<Prisma.$UsuarioAgenciaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UsuarioAgencias.
     * @param {UsuarioAgenciaCreateManyArgs} args - Arguments to create many UsuarioAgencias.
     * @example
     * // Create many UsuarioAgencias
     * const usuarioAgencia = await prisma.usuarioAgencia.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UsuarioAgenciaCreateManyArgs>(args?: SelectSubset<T, UsuarioAgenciaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UsuarioAgencias and returns the data saved in the database.
     * @param {UsuarioAgenciaCreateManyAndReturnArgs} args - Arguments to create many UsuarioAgencias.
     * @example
     * // Create many UsuarioAgencias
     * const usuarioAgencia = await prisma.usuarioAgencia.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UsuarioAgencias and only return the `id`
     * const usuarioAgenciaWithIdOnly = await prisma.usuarioAgencia.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UsuarioAgenciaCreateManyAndReturnArgs>(args?: SelectSubset<T, UsuarioAgenciaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsuarioAgenciaPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UsuarioAgencia.
     * @param {UsuarioAgenciaDeleteArgs} args - Arguments to delete one UsuarioAgencia.
     * @example
     * // Delete one UsuarioAgencia
     * const UsuarioAgencia = await prisma.usuarioAgencia.delete({
     *   where: {
     *     // ... filter to delete one UsuarioAgencia
     *   }
     * })
     * 
     */
    delete<T extends UsuarioAgenciaDeleteArgs>(args: SelectSubset<T, UsuarioAgenciaDeleteArgs<ExtArgs>>): Prisma__UsuarioAgenciaClient<$Result.GetResult<Prisma.$UsuarioAgenciaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UsuarioAgencia.
     * @param {UsuarioAgenciaUpdateArgs} args - Arguments to update one UsuarioAgencia.
     * @example
     * // Update one UsuarioAgencia
     * const usuarioAgencia = await prisma.usuarioAgencia.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UsuarioAgenciaUpdateArgs>(args: SelectSubset<T, UsuarioAgenciaUpdateArgs<ExtArgs>>): Prisma__UsuarioAgenciaClient<$Result.GetResult<Prisma.$UsuarioAgenciaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UsuarioAgencias.
     * @param {UsuarioAgenciaDeleteManyArgs} args - Arguments to filter UsuarioAgencias to delete.
     * @example
     * // Delete a few UsuarioAgencias
     * const { count } = await prisma.usuarioAgencia.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UsuarioAgenciaDeleteManyArgs>(args?: SelectSubset<T, UsuarioAgenciaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UsuarioAgencias.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioAgenciaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UsuarioAgencias
     * const usuarioAgencia = await prisma.usuarioAgencia.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UsuarioAgenciaUpdateManyArgs>(args: SelectSubset<T, UsuarioAgenciaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UsuarioAgencias and returns the data updated in the database.
     * @param {UsuarioAgenciaUpdateManyAndReturnArgs} args - Arguments to update many UsuarioAgencias.
     * @example
     * // Update many UsuarioAgencias
     * const usuarioAgencia = await prisma.usuarioAgencia.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UsuarioAgencias and only return the `id`
     * const usuarioAgenciaWithIdOnly = await prisma.usuarioAgencia.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UsuarioAgenciaUpdateManyAndReturnArgs>(args: SelectSubset<T, UsuarioAgenciaUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsuarioAgenciaPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UsuarioAgencia.
     * @param {UsuarioAgenciaUpsertArgs} args - Arguments to update or create a UsuarioAgencia.
     * @example
     * // Update or create a UsuarioAgencia
     * const usuarioAgencia = await prisma.usuarioAgencia.upsert({
     *   create: {
     *     // ... data to create a UsuarioAgencia
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UsuarioAgencia we want to update
     *   }
     * })
     */
    upsert<T extends UsuarioAgenciaUpsertArgs>(args: SelectSubset<T, UsuarioAgenciaUpsertArgs<ExtArgs>>): Prisma__UsuarioAgenciaClient<$Result.GetResult<Prisma.$UsuarioAgenciaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UsuarioAgencias.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioAgenciaCountArgs} args - Arguments to filter UsuarioAgencias to count.
     * @example
     * // Count the number of UsuarioAgencias
     * const count = await prisma.usuarioAgencia.count({
     *   where: {
     *     // ... the filter for the UsuarioAgencias we want to count
     *   }
     * })
    **/
    count<T extends UsuarioAgenciaCountArgs>(
      args?: Subset<T, UsuarioAgenciaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UsuarioAgenciaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UsuarioAgencia.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioAgenciaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UsuarioAgenciaAggregateArgs>(args: Subset<T, UsuarioAgenciaAggregateArgs>): Prisma.PrismaPromise<GetUsuarioAgenciaAggregateType<T>>

    /**
     * Group by UsuarioAgencia.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioAgenciaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UsuarioAgenciaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UsuarioAgenciaGroupByArgs['orderBy'] }
        : { orderBy?: UsuarioAgenciaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UsuarioAgenciaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUsuarioAgenciaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UsuarioAgencia model
   */
  readonly fields: UsuarioAgenciaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UsuarioAgencia.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UsuarioAgenciaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    agencia<T extends UsuarioAgencia$agenciaArgs<ExtArgs> = {}>(args?: Subset<T, UsuarioAgencia$agenciaArgs<ExtArgs>>): Prisma__AgenciaClient<$Result.GetResult<Prisma.$AgenciaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    cotizaciones<T extends UsuarioAgencia$cotizacionesArgs<ExtArgs> = {}>(args?: Subset<T, UsuarioAgencia$cotizacionesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    historialCambios<T extends UsuarioAgencia$historialCambiosArgs<ExtArgs> = {}>(args?: Subset<T, UsuarioAgencia$historialCambiosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HistorialCotizacionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UsuarioAgencia model
   */
  interface UsuarioAgenciaFieldRefs {
    readonly id: FieldRef<"UsuarioAgencia", 'String'>
    readonly name: FieldRef<"UsuarioAgencia", 'String'>
    readonly email: FieldRef<"UsuarioAgencia", 'String'>
    readonly password: FieldRef<"UsuarioAgencia", 'String'>
    readonly role: FieldRef<"UsuarioAgencia", 'String'>
    readonly agenciaId: FieldRef<"UsuarioAgencia", 'String'>
  }
    

  // Custom InputTypes
  /**
   * UsuarioAgencia findUnique
   */
  export type UsuarioAgenciaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsuarioAgencia
     */
    select?: UsuarioAgenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsuarioAgencia
     */
    omit?: UsuarioAgenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioAgenciaInclude<ExtArgs> | null
    /**
     * Filter, which UsuarioAgencia to fetch.
     */
    where: UsuarioAgenciaWhereUniqueInput
  }

  /**
   * UsuarioAgencia findUniqueOrThrow
   */
  export type UsuarioAgenciaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsuarioAgencia
     */
    select?: UsuarioAgenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsuarioAgencia
     */
    omit?: UsuarioAgenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioAgenciaInclude<ExtArgs> | null
    /**
     * Filter, which UsuarioAgencia to fetch.
     */
    where: UsuarioAgenciaWhereUniqueInput
  }

  /**
   * UsuarioAgencia findFirst
   */
  export type UsuarioAgenciaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsuarioAgencia
     */
    select?: UsuarioAgenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsuarioAgencia
     */
    omit?: UsuarioAgenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioAgenciaInclude<ExtArgs> | null
    /**
     * Filter, which UsuarioAgencia to fetch.
     */
    where?: UsuarioAgenciaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UsuarioAgencias to fetch.
     */
    orderBy?: UsuarioAgenciaOrderByWithRelationInput | UsuarioAgenciaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UsuarioAgencias.
     */
    cursor?: UsuarioAgenciaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UsuarioAgencias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UsuarioAgencias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UsuarioAgencias.
     */
    distinct?: UsuarioAgenciaScalarFieldEnum | UsuarioAgenciaScalarFieldEnum[]
  }

  /**
   * UsuarioAgencia findFirstOrThrow
   */
  export type UsuarioAgenciaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsuarioAgencia
     */
    select?: UsuarioAgenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsuarioAgencia
     */
    omit?: UsuarioAgenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioAgenciaInclude<ExtArgs> | null
    /**
     * Filter, which UsuarioAgencia to fetch.
     */
    where?: UsuarioAgenciaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UsuarioAgencias to fetch.
     */
    orderBy?: UsuarioAgenciaOrderByWithRelationInput | UsuarioAgenciaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UsuarioAgencias.
     */
    cursor?: UsuarioAgenciaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UsuarioAgencias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UsuarioAgencias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UsuarioAgencias.
     */
    distinct?: UsuarioAgenciaScalarFieldEnum | UsuarioAgenciaScalarFieldEnum[]
  }

  /**
   * UsuarioAgencia findMany
   */
  export type UsuarioAgenciaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsuarioAgencia
     */
    select?: UsuarioAgenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsuarioAgencia
     */
    omit?: UsuarioAgenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioAgenciaInclude<ExtArgs> | null
    /**
     * Filter, which UsuarioAgencias to fetch.
     */
    where?: UsuarioAgenciaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UsuarioAgencias to fetch.
     */
    orderBy?: UsuarioAgenciaOrderByWithRelationInput | UsuarioAgenciaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UsuarioAgencias.
     */
    cursor?: UsuarioAgenciaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UsuarioAgencias from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UsuarioAgencias.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UsuarioAgencias.
     */
    distinct?: UsuarioAgenciaScalarFieldEnum | UsuarioAgenciaScalarFieldEnum[]
  }

  /**
   * UsuarioAgencia create
   */
  export type UsuarioAgenciaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsuarioAgencia
     */
    select?: UsuarioAgenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsuarioAgencia
     */
    omit?: UsuarioAgenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioAgenciaInclude<ExtArgs> | null
    /**
     * The data needed to create a UsuarioAgencia.
     */
    data: XOR<UsuarioAgenciaCreateInput, UsuarioAgenciaUncheckedCreateInput>
  }

  /**
   * UsuarioAgencia createMany
   */
  export type UsuarioAgenciaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UsuarioAgencias.
     */
    data: UsuarioAgenciaCreateManyInput | UsuarioAgenciaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UsuarioAgencia createManyAndReturn
   */
  export type UsuarioAgenciaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsuarioAgencia
     */
    select?: UsuarioAgenciaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UsuarioAgencia
     */
    omit?: UsuarioAgenciaOmit<ExtArgs> | null
    /**
     * The data used to create many UsuarioAgencias.
     */
    data: UsuarioAgenciaCreateManyInput | UsuarioAgenciaCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioAgenciaIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UsuarioAgencia update
   */
  export type UsuarioAgenciaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsuarioAgencia
     */
    select?: UsuarioAgenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsuarioAgencia
     */
    omit?: UsuarioAgenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioAgenciaInclude<ExtArgs> | null
    /**
     * The data needed to update a UsuarioAgencia.
     */
    data: XOR<UsuarioAgenciaUpdateInput, UsuarioAgenciaUncheckedUpdateInput>
    /**
     * Choose, which UsuarioAgencia to update.
     */
    where: UsuarioAgenciaWhereUniqueInput
  }

  /**
   * UsuarioAgencia updateMany
   */
  export type UsuarioAgenciaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UsuarioAgencias.
     */
    data: XOR<UsuarioAgenciaUpdateManyMutationInput, UsuarioAgenciaUncheckedUpdateManyInput>
    /**
     * Filter which UsuarioAgencias to update
     */
    where?: UsuarioAgenciaWhereInput
    /**
     * Limit how many UsuarioAgencias to update.
     */
    limit?: number
  }

  /**
   * UsuarioAgencia updateManyAndReturn
   */
  export type UsuarioAgenciaUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsuarioAgencia
     */
    select?: UsuarioAgenciaSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UsuarioAgencia
     */
    omit?: UsuarioAgenciaOmit<ExtArgs> | null
    /**
     * The data used to update UsuarioAgencias.
     */
    data: XOR<UsuarioAgenciaUpdateManyMutationInput, UsuarioAgenciaUncheckedUpdateManyInput>
    /**
     * Filter which UsuarioAgencias to update
     */
    where?: UsuarioAgenciaWhereInput
    /**
     * Limit how many UsuarioAgencias to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioAgenciaIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UsuarioAgencia upsert
   */
  export type UsuarioAgenciaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsuarioAgencia
     */
    select?: UsuarioAgenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsuarioAgencia
     */
    omit?: UsuarioAgenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioAgenciaInclude<ExtArgs> | null
    /**
     * The filter to search for the UsuarioAgencia to update in case it exists.
     */
    where: UsuarioAgenciaWhereUniqueInput
    /**
     * In case the UsuarioAgencia found by the `where` argument doesn't exist, create a new UsuarioAgencia with this data.
     */
    create: XOR<UsuarioAgenciaCreateInput, UsuarioAgenciaUncheckedCreateInput>
    /**
     * In case the UsuarioAgencia was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UsuarioAgenciaUpdateInput, UsuarioAgenciaUncheckedUpdateInput>
  }

  /**
   * UsuarioAgencia delete
   */
  export type UsuarioAgenciaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsuarioAgencia
     */
    select?: UsuarioAgenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsuarioAgencia
     */
    omit?: UsuarioAgenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioAgenciaInclude<ExtArgs> | null
    /**
     * Filter which UsuarioAgencia to delete.
     */
    where: UsuarioAgenciaWhereUniqueInput
  }

  /**
   * UsuarioAgencia deleteMany
   */
  export type UsuarioAgenciaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UsuarioAgencias to delete
     */
    where?: UsuarioAgenciaWhereInput
    /**
     * Limit how many UsuarioAgencias to delete.
     */
    limit?: number
  }

  /**
   * UsuarioAgencia.agencia
   */
  export type UsuarioAgencia$agenciaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agencia
     */
    select?: AgenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Agencia
     */
    omit?: AgenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgenciaInclude<ExtArgs> | null
    where?: AgenciaWhereInput
  }

  /**
   * UsuarioAgencia.cotizaciones
   */
  export type UsuarioAgencia$cotizacionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cotizacion
     */
    omit?: CotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    where?: CotizacionWhereInput
    orderBy?: CotizacionOrderByWithRelationInput | CotizacionOrderByWithRelationInput[]
    cursor?: CotizacionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CotizacionScalarFieldEnum | CotizacionScalarFieldEnum[]
  }

  /**
   * UsuarioAgencia.historialCambios
   */
  export type UsuarioAgencia$historialCambiosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorialCotizacion
     */
    select?: HistorialCotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HistorialCotizacion
     */
    omit?: HistorialCotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistorialCotizacionInclude<ExtArgs> | null
    where?: HistorialCotizacionWhereInput
    orderBy?: HistorialCotizacionOrderByWithRelationInput | HistorialCotizacionOrderByWithRelationInput[]
    cursor?: HistorialCotizacionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: HistorialCotizacionScalarFieldEnum | HistorialCotizacionScalarFieldEnum[]
  }

  /**
   * UsuarioAgencia without action
   */
  export type UsuarioAgenciaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsuarioAgencia
     */
    select?: UsuarioAgenciaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UsuarioAgencia
     */
    omit?: UsuarioAgenciaOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioAgenciaInclude<ExtArgs> | null
  }


  /**
   * Model DestinoRef
   */

  export type AggregateDestinoRef = {
    _count: DestinoRefCountAggregateOutputType | null
    _avg: DestinoRefAvgAggregateOutputType | null
    _sum: DestinoRefSumAggregateOutputType | null
    _min: DestinoRefMinAggregateOutputType | null
    _max: DestinoRefMaxAggregateOutputType | null
  }

  export type DestinoRefAvgAggregateOutputType = {
    id: number | null
  }

  export type DestinoRefSumAggregateOutputType = {
    id: number | null
  }

  export type DestinoRefMinAggregateOutputType = {
    id: number | null
    pais: string | null
    ciudad: string | null
    tagline: string | null
    descripcion: string | null
    imagen: string | null
    color: string | null
  }

  export type DestinoRefMaxAggregateOutputType = {
    id: number | null
    pais: string | null
    ciudad: string | null
    tagline: string | null
    descripcion: string | null
    imagen: string | null
    color: string | null
  }

  export type DestinoRefCountAggregateOutputType = {
    id: number
    pais: number
    ciudad: number
    tagline: number
    descripcion: number
    imagen: number
    color: number
    _all: number
  }


  export type DestinoRefAvgAggregateInputType = {
    id?: true
  }

  export type DestinoRefSumAggregateInputType = {
    id?: true
  }

  export type DestinoRefMinAggregateInputType = {
    id?: true
    pais?: true
    ciudad?: true
    tagline?: true
    descripcion?: true
    imagen?: true
    color?: true
  }

  export type DestinoRefMaxAggregateInputType = {
    id?: true
    pais?: true
    ciudad?: true
    tagline?: true
    descripcion?: true
    imagen?: true
    color?: true
  }

  export type DestinoRefCountAggregateInputType = {
    id?: true
    pais?: true
    ciudad?: true
    tagline?: true
    descripcion?: true
    imagen?: true
    color?: true
    _all?: true
  }

  export type DestinoRefAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DestinoRef to aggregate.
     */
    where?: DestinoRefWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DestinoRefs to fetch.
     */
    orderBy?: DestinoRefOrderByWithRelationInput | DestinoRefOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DestinoRefWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DestinoRefs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DestinoRefs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DestinoRefs
    **/
    _count?: true | DestinoRefCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DestinoRefAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DestinoRefSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DestinoRefMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DestinoRefMaxAggregateInputType
  }

  export type GetDestinoRefAggregateType<T extends DestinoRefAggregateArgs> = {
        [P in keyof T & keyof AggregateDestinoRef]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDestinoRef[P]>
      : GetScalarType<T[P], AggregateDestinoRef[P]>
  }




  export type DestinoRefGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DestinoRefWhereInput
    orderBy?: DestinoRefOrderByWithAggregationInput | DestinoRefOrderByWithAggregationInput[]
    by: DestinoRefScalarFieldEnum[] | DestinoRefScalarFieldEnum
    having?: DestinoRefScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DestinoRefCountAggregateInputType | true
    _avg?: DestinoRefAvgAggregateInputType
    _sum?: DestinoRefSumAggregateInputType
    _min?: DestinoRefMinAggregateInputType
    _max?: DestinoRefMaxAggregateInputType
  }

  export type DestinoRefGroupByOutputType = {
    id: number
    pais: string
    ciudad: string
    tagline: string | null
    descripcion: string | null
    imagen: string | null
    color: string | null
    _count: DestinoRefCountAggregateOutputType | null
    _avg: DestinoRefAvgAggregateOutputType | null
    _sum: DestinoRefSumAggregateOutputType | null
    _min: DestinoRefMinAggregateOutputType | null
    _max: DestinoRefMaxAggregateOutputType | null
  }

  type GetDestinoRefGroupByPayload<T extends DestinoRefGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DestinoRefGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DestinoRefGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DestinoRefGroupByOutputType[P]>
            : GetScalarType<T[P], DestinoRefGroupByOutputType[P]>
        }
      >
    >


  export type DestinoRefSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pais?: boolean
    ciudad?: boolean
    tagline?: boolean
    descripcion?: boolean
    imagen?: boolean
    color?: boolean
    paquetes?: boolean | DestinoRef$paquetesArgs<ExtArgs>
    _count?: boolean | DestinoRefCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["destinoRef"]>

  export type DestinoRefSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pais?: boolean
    ciudad?: boolean
    tagline?: boolean
    descripcion?: boolean
    imagen?: boolean
    color?: boolean
  }, ExtArgs["result"]["destinoRef"]>

  export type DestinoRefSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    pais?: boolean
    ciudad?: boolean
    tagline?: boolean
    descripcion?: boolean
    imagen?: boolean
    color?: boolean
  }, ExtArgs["result"]["destinoRef"]>

  export type DestinoRefSelectScalar = {
    id?: boolean
    pais?: boolean
    ciudad?: boolean
    tagline?: boolean
    descripcion?: boolean
    imagen?: boolean
    color?: boolean
  }

  export type DestinoRefOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "pais" | "ciudad" | "tagline" | "descripcion" | "imagen" | "color", ExtArgs["result"]["destinoRef"]>
  export type DestinoRefInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    paquetes?: boolean | DestinoRef$paquetesArgs<ExtArgs>
    _count?: boolean | DestinoRefCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DestinoRefIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type DestinoRefIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $DestinoRefPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DestinoRef"
    objects: {
      paquetes: Prisma.$PaqueteRefPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      pais: string
      ciudad: string
      tagline: string | null
      descripcion: string | null
      imagen: string | null
      color: string | null
    }, ExtArgs["result"]["destinoRef"]>
    composites: {}
  }

  type DestinoRefGetPayload<S extends boolean | null | undefined | DestinoRefDefaultArgs> = $Result.GetResult<Prisma.$DestinoRefPayload, S>

  type DestinoRefCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DestinoRefFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DestinoRefCountAggregateInputType | true
    }

  export interface DestinoRefDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DestinoRef'], meta: { name: 'DestinoRef' } }
    /**
     * Find zero or one DestinoRef that matches the filter.
     * @param {DestinoRefFindUniqueArgs} args - Arguments to find a DestinoRef
     * @example
     * // Get one DestinoRef
     * const destinoRef = await prisma.destinoRef.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DestinoRefFindUniqueArgs>(args: SelectSubset<T, DestinoRefFindUniqueArgs<ExtArgs>>): Prisma__DestinoRefClient<$Result.GetResult<Prisma.$DestinoRefPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DestinoRef that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DestinoRefFindUniqueOrThrowArgs} args - Arguments to find a DestinoRef
     * @example
     * // Get one DestinoRef
     * const destinoRef = await prisma.destinoRef.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DestinoRefFindUniqueOrThrowArgs>(args: SelectSubset<T, DestinoRefFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DestinoRefClient<$Result.GetResult<Prisma.$DestinoRefPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DestinoRef that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinoRefFindFirstArgs} args - Arguments to find a DestinoRef
     * @example
     * // Get one DestinoRef
     * const destinoRef = await prisma.destinoRef.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DestinoRefFindFirstArgs>(args?: SelectSubset<T, DestinoRefFindFirstArgs<ExtArgs>>): Prisma__DestinoRefClient<$Result.GetResult<Prisma.$DestinoRefPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DestinoRef that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinoRefFindFirstOrThrowArgs} args - Arguments to find a DestinoRef
     * @example
     * // Get one DestinoRef
     * const destinoRef = await prisma.destinoRef.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DestinoRefFindFirstOrThrowArgs>(args?: SelectSubset<T, DestinoRefFindFirstOrThrowArgs<ExtArgs>>): Prisma__DestinoRefClient<$Result.GetResult<Prisma.$DestinoRefPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DestinoRefs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinoRefFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DestinoRefs
     * const destinoRefs = await prisma.destinoRef.findMany()
     * 
     * // Get first 10 DestinoRefs
     * const destinoRefs = await prisma.destinoRef.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const destinoRefWithIdOnly = await prisma.destinoRef.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DestinoRefFindManyArgs>(args?: SelectSubset<T, DestinoRefFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DestinoRefPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DestinoRef.
     * @param {DestinoRefCreateArgs} args - Arguments to create a DestinoRef.
     * @example
     * // Create one DestinoRef
     * const DestinoRef = await prisma.destinoRef.create({
     *   data: {
     *     // ... data to create a DestinoRef
     *   }
     * })
     * 
     */
    create<T extends DestinoRefCreateArgs>(args: SelectSubset<T, DestinoRefCreateArgs<ExtArgs>>): Prisma__DestinoRefClient<$Result.GetResult<Prisma.$DestinoRefPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DestinoRefs.
     * @param {DestinoRefCreateManyArgs} args - Arguments to create many DestinoRefs.
     * @example
     * // Create many DestinoRefs
     * const destinoRef = await prisma.destinoRef.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DestinoRefCreateManyArgs>(args?: SelectSubset<T, DestinoRefCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DestinoRefs and returns the data saved in the database.
     * @param {DestinoRefCreateManyAndReturnArgs} args - Arguments to create many DestinoRefs.
     * @example
     * // Create many DestinoRefs
     * const destinoRef = await prisma.destinoRef.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DestinoRefs and only return the `id`
     * const destinoRefWithIdOnly = await prisma.destinoRef.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DestinoRefCreateManyAndReturnArgs>(args?: SelectSubset<T, DestinoRefCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DestinoRefPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DestinoRef.
     * @param {DestinoRefDeleteArgs} args - Arguments to delete one DestinoRef.
     * @example
     * // Delete one DestinoRef
     * const DestinoRef = await prisma.destinoRef.delete({
     *   where: {
     *     // ... filter to delete one DestinoRef
     *   }
     * })
     * 
     */
    delete<T extends DestinoRefDeleteArgs>(args: SelectSubset<T, DestinoRefDeleteArgs<ExtArgs>>): Prisma__DestinoRefClient<$Result.GetResult<Prisma.$DestinoRefPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DestinoRef.
     * @param {DestinoRefUpdateArgs} args - Arguments to update one DestinoRef.
     * @example
     * // Update one DestinoRef
     * const destinoRef = await prisma.destinoRef.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DestinoRefUpdateArgs>(args: SelectSubset<T, DestinoRefUpdateArgs<ExtArgs>>): Prisma__DestinoRefClient<$Result.GetResult<Prisma.$DestinoRefPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DestinoRefs.
     * @param {DestinoRefDeleteManyArgs} args - Arguments to filter DestinoRefs to delete.
     * @example
     * // Delete a few DestinoRefs
     * const { count } = await prisma.destinoRef.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DestinoRefDeleteManyArgs>(args?: SelectSubset<T, DestinoRefDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DestinoRefs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinoRefUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DestinoRefs
     * const destinoRef = await prisma.destinoRef.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DestinoRefUpdateManyArgs>(args: SelectSubset<T, DestinoRefUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DestinoRefs and returns the data updated in the database.
     * @param {DestinoRefUpdateManyAndReturnArgs} args - Arguments to update many DestinoRefs.
     * @example
     * // Update many DestinoRefs
     * const destinoRef = await prisma.destinoRef.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DestinoRefs and only return the `id`
     * const destinoRefWithIdOnly = await prisma.destinoRef.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DestinoRefUpdateManyAndReturnArgs>(args: SelectSubset<T, DestinoRefUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DestinoRefPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DestinoRef.
     * @param {DestinoRefUpsertArgs} args - Arguments to update or create a DestinoRef.
     * @example
     * // Update or create a DestinoRef
     * const destinoRef = await prisma.destinoRef.upsert({
     *   create: {
     *     // ... data to create a DestinoRef
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DestinoRef we want to update
     *   }
     * })
     */
    upsert<T extends DestinoRefUpsertArgs>(args: SelectSubset<T, DestinoRefUpsertArgs<ExtArgs>>): Prisma__DestinoRefClient<$Result.GetResult<Prisma.$DestinoRefPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DestinoRefs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinoRefCountArgs} args - Arguments to filter DestinoRefs to count.
     * @example
     * // Count the number of DestinoRefs
     * const count = await prisma.destinoRef.count({
     *   where: {
     *     // ... the filter for the DestinoRefs we want to count
     *   }
     * })
    **/
    count<T extends DestinoRefCountArgs>(
      args?: Subset<T, DestinoRefCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DestinoRefCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DestinoRef.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinoRefAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DestinoRefAggregateArgs>(args: Subset<T, DestinoRefAggregateArgs>): Prisma.PrismaPromise<GetDestinoRefAggregateType<T>>

    /**
     * Group by DestinoRef.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DestinoRefGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DestinoRefGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DestinoRefGroupByArgs['orderBy'] }
        : { orderBy?: DestinoRefGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DestinoRefGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDestinoRefGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DestinoRef model
   */
  readonly fields: DestinoRefFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DestinoRef.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DestinoRefClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    paquetes<T extends DestinoRef$paquetesArgs<ExtArgs> = {}>(args?: Subset<T, DestinoRef$paquetesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaqueteRefPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DestinoRef model
   */
  interface DestinoRefFieldRefs {
    readonly id: FieldRef<"DestinoRef", 'Int'>
    readonly pais: FieldRef<"DestinoRef", 'String'>
    readonly ciudad: FieldRef<"DestinoRef", 'String'>
    readonly tagline: FieldRef<"DestinoRef", 'String'>
    readonly descripcion: FieldRef<"DestinoRef", 'String'>
    readonly imagen: FieldRef<"DestinoRef", 'String'>
    readonly color: FieldRef<"DestinoRef", 'String'>
  }
    

  // Custom InputTypes
  /**
   * DestinoRef findUnique
   */
  export type DestinoRefFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinoRef
     */
    select?: DestinoRefSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DestinoRef
     */
    omit?: DestinoRefOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinoRefInclude<ExtArgs> | null
    /**
     * Filter, which DestinoRef to fetch.
     */
    where: DestinoRefWhereUniqueInput
  }

  /**
   * DestinoRef findUniqueOrThrow
   */
  export type DestinoRefFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinoRef
     */
    select?: DestinoRefSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DestinoRef
     */
    omit?: DestinoRefOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinoRefInclude<ExtArgs> | null
    /**
     * Filter, which DestinoRef to fetch.
     */
    where: DestinoRefWhereUniqueInput
  }

  /**
   * DestinoRef findFirst
   */
  export type DestinoRefFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinoRef
     */
    select?: DestinoRefSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DestinoRef
     */
    omit?: DestinoRefOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinoRefInclude<ExtArgs> | null
    /**
     * Filter, which DestinoRef to fetch.
     */
    where?: DestinoRefWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DestinoRefs to fetch.
     */
    orderBy?: DestinoRefOrderByWithRelationInput | DestinoRefOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DestinoRefs.
     */
    cursor?: DestinoRefWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DestinoRefs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DestinoRefs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DestinoRefs.
     */
    distinct?: DestinoRefScalarFieldEnum | DestinoRefScalarFieldEnum[]
  }

  /**
   * DestinoRef findFirstOrThrow
   */
  export type DestinoRefFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinoRef
     */
    select?: DestinoRefSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DestinoRef
     */
    omit?: DestinoRefOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinoRefInclude<ExtArgs> | null
    /**
     * Filter, which DestinoRef to fetch.
     */
    where?: DestinoRefWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DestinoRefs to fetch.
     */
    orderBy?: DestinoRefOrderByWithRelationInput | DestinoRefOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DestinoRefs.
     */
    cursor?: DestinoRefWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DestinoRefs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DestinoRefs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DestinoRefs.
     */
    distinct?: DestinoRefScalarFieldEnum | DestinoRefScalarFieldEnum[]
  }

  /**
   * DestinoRef findMany
   */
  export type DestinoRefFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinoRef
     */
    select?: DestinoRefSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DestinoRef
     */
    omit?: DestinoRefOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinoRefInclude<ExtArgs> | null
    /**
     * Filter, which DestinoRefs to fetch.
     */
    where?: DestinoRefWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DestinoRefs to fetch.
     */
    orderBy?: DestinoRefOrderByWithRelationInput | DestinoRefOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DestinoRefs.
     */
    cursor?: DestinoRefWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DestinoRefs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DestinoRefs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DestinoRefs.
     */
    distinct?: DestinoRefScalarFieldEnum | DestinoRefScalarFieldEnum[]
  }

  /**
   * DestinoRef create
   */
  export type DestinoRefCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinoRef
     */
    select?: DestinoRefSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DestinoRef
     */
    omit?: DestinoRefOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinoRefInclude<ExtArgs> | null
    /**
     * The data needed to create a DestinoRef.
     */
    data: XOR<DestinoRefCreateInput, DestinoRefUncheckedCreateInput>
  }

  /**
   * DestinoRef createMany
   */
  export type DestinoRefCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DestinoRefs.
     */
    data: DestinoRefCreateManyInput | DestinoRefCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DestinoRef createManyAndReturn
   */
  export type DestinoRefCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinoRef
     */
    select?: DestinoRefSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DestinoRef
     */
    omit?: DestinoRefOmit<ExtArgs> | null
    /**
     * The data used to create many DestinoRefs.
     */
    data: DestinoRefCreateManyInput | DestinoRefCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DestinoRef update
   */
  export type DestinoRefUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinoRef
     */
    select?: DestinoRefSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DestinoRef
     */
    omit?: DestinoRefOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinoRefInclude<ExtArgs> | null
    /**
     * The data needed to update a DestinoRef.
     */
    data: XOR<DestinoRefUpdateInput, DestinoRefUncheckedUpdateInput>
    /**
     * Choose, which DestinoRef to update.
     */
    where: DestinoRefWhereUniqueInput
  }

  /**
   * DestinoRef updateMany
   */
  export type DestinoRefUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DestinoRefs.
     */
    data: XOR<DestinoRefUpdateManyMutationInput, DestinoRefUncheckedUpdateManyInput>
    /**
     * Filter which DestinoRefs to update
     */
    where?: DestinoRefWhereInput
    /**
     * Limit how many DestinoRefs to update.
     */
    limit?: number
  }

  /**
   * DestinoRef updateManyAndReturn
   */
  export type DestinoRefUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinoRef
     */
    select?: DestinoRefSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DestinoRef
     */
    omit?: DestinoRefOmit<ExtArgs> | null
    /**
     * The data used to update DestinoRefs.
     */
    data: XOR<DestinoRefUpdateManyMutationInput, DestinoRefUncheckedUpdateManyInput>
    /**
     * Filter which DestinoRefs to update
     */
    where?: DestinoRefWhereInput
    /**
     * Limit how many DestinoRefs to update.
     */
    limit?: number
  }

  /**
   * DestinoRef upsert
   */
  export type DestinoRefUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinoRef
     */
    select?: DestinoRefSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DestinoRef
     */
    omit?: DestinoRefOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinoRefInclude<ExtArgs> | null
    /**
     * The filter to search for the DestinoRef to update in case it exists.
     */
    where: DestinoRefWhereUniqueInput
    /**
     * In case the DestinoRef found by the `where` argument doesn't exist, create a new DestinoRef with this data.
     */
    create: XOR<DestinoRefCreateInput, DestinoRefUncheckedCreateInput>
    /**
     * In case the DestinoRef was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DestinoRefUpdateInput, DestinoRefUncheckedUpdateInput>
  }

  /**
   * DestinoRef delete
   */
  export type DestinoRefDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinoRef
     */
    select?: DestinoRefSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DestinoRef
     */
    omit?: DestinoRefOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinoRefInclude<ExtArgs> | null
    /**
     * Filter which DestinoRef to delete.
     */
    where: DestinoRefWhereUniqueInput
  }

  /**
   * DestinoRef deleteMany
   */
  export type DestinoRefDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DestinoRefs to delete
     */
    where?: DestinoRefWhereInput
    /**
     * Limit how many DestinoRefs to delete.
     */
    limit?: number
  }

  /**
   * DestinoRef.paquetes
   */
  export type DestinoRef$paquetesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PaqueteRef
     */
    select?: PaqueteRefSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PaqueteRef
     */
    omit?: PaqueteRefOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaqueteRefInclude<ExtArgs> | null
    where?: PaqueteRefWhereInput
    orderBy?: PaqueteRefOrderByWithRelationInput | PaqueteRefOrderByWithRelationInput[]
    cursor?: PaqueteRefWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PaqueteRefScalarFieldEnum | PaqueteRefScalarFieldEnum[]
  }

  /**
   * DestinoRef without action
   */
  export type DestinoRefDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinoRef
     */
    select?: DestinoRefSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DestinoRef
     */
    omit?: DestinoRefOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinoRefInclude<ExtArgs> | null
  }


  /**
   * Model PaqueteRef
   */

  export type AggregatePaqueteRef = {
    _count: PaqueteRefCountAggregateOutputType | null
    _avg: PaqueteRefAvgAggregateOutputType | null
    _sum: PaqueteRefSumAggregateOutputType | null
    _min: PaqueteRefMinAggregateOutputType | null
    _max: PaqueteRefMaxAggregateOutputType | null
  }

  export type PaqueteRefAvgAggregateOutputType = {
    id: number | null
    diasEstancia: number | null
    nochesBase: number | null
    precioBoleto: number | null
    precioSGL: number | null
    precioDBL: number | null
    precioTPL: number | null
    precioQUAD: number | null
    precioPorPersona: number | null
    destinoId: number | null
  }

  export type PaqueteRefSumAggregateOutputType = {
    id: number | null
    diasEstancia: number | null
    nochesBase: number | null
    precioBoleto: number | null
    precioSGL: number | null
    precioDBL: number | null
    precioTPL: number | null
    precioQUAD: number | null
    precioPorPersona: number | null
    destinoId: number | null
  }

  export type PaqueteRefMinAggregateOutputType = {
    id: number | null
    nombre: string | null
    descripcion: string | null
    imagen: string | null
    categoria: string | null
    diasEstancia: number | null
    nochesBase: number | null
    incluyeBoleto: boolean | null
    precioBoleto: number | null
    precioSGL: number | null
    precioDBL: number | null
    precioTPL: number | null
    precioQUAD: number | null
    precioPorPersona: number | null
    destinoId: number | null
  }

  export type PaqueteRefMaxAggregateOutputType = {
    id: number | null
    nombre: string | null
    descripcion: string | null
    imagen: string | null
    categoria: string | null
    diasEstancia: number | null
    nochesBase: number | null
    incluyeBoleto: boolean | null
    precioBoleto: number | null
    precioSGL: number | null
    precioDBL: number | null
    precioTPL: number | null
    precioQUAD: number | null
    precioPorPersona: number | null
    destinoId: number | null
  }

  export type PaqueteRefCountAggregateOutputType = {
    id: number
    nombre: number
    descripcion: number
    imagen: number
    categoria: number
    diasEstancia: number
    nochesBase: number
    incluyeBoleto: number
    precioBoleto: number
    precioSGL: number
    precioDBL: number
    precioTPL: number
    precioQUAD: number
    precioPorPersona: number
    destinoId: number
    _all: number
  }


  export type PaqueteRefAvgAggregateInputType = {
    id?: true
    diasEstancia?: true
    nochesBase?: true
    precioBoleto?: true
    precioSGL?: true
    precioDBL?: true
    precioTPL?: true
    precioQUAD?: true
    precioPorPersona?: true
    destinoId?: true
  }

  export type PaqueteRefSumAggregateInputType = {
    id?: true
    diasEstancia?: true
    nochesBase?: true
    precioBoleto?: true
    precioSGL?: true
    precioDBL?: true
    precioTPL?: true
    precioQUAD?: true
    precioPorPersona?: true
    destinoId?: true
  }

  export type PaqueteRefMinAggregateInputType = {
    id?: true
    nombre?: true
    descripcion?: true
    imagen?: true
    categoria?: true
    diasEstancia?: true
    nochesBase?: true
    incluyeBoleto?: true
    precioBoleto?: true
    precioSGL?: true
    precioDBL?: true
    precioTPL?: true
    precioQUAD?: true
    precioPorPersona?: true
    destinoId?: true
  }

  export type PaqueteRefMaxAggregateInputType = {
    id?: true
    nombre?: true
    descripcion?: true
    imagen?: true
    categoria?: true
    diasEstancia?: true
    nochesBase?: true
    incluyeBoleto?: true
    precioBoleto?: true
    precioSGL?: true
    precioDBL?: true
    precioTPL?: true
    precioQUAD?: true
    precioPorPersona?: true
    destinoId?: true
  }

  export type PaqueteRefCountAggregateInputType = {
    id?: true
    nombre?: true
    descripcion?: true
    imagen?: true
    categoria?: true
    diasEstancia?: true
    nochesBase?: true
    incluyeBoleto?: true
    precioBoleto?: true
    precioSGL?: true
    precioDBL?: true
    precioTPL?: true
    precioQUAD?: true
    precioPorPersona?: true
    destinoId?: true
    _all?: true
  }

  export type PaqueteRefAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PaqueteRef to aggregate.
     */
    where?: PaqueteRefWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PaqueteRefs to fetch.
     */
    orderBy?: PaqueteRefOrderByWithRelationInput | PaqueteRefOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PaqueteRefWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PaqueteRefs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PaqueteRefs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PaqueteRefs
    **/
    _count?: true | PaqueteRefCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PaqueteRefAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PaqueteRefSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PaqueteRefMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PaqueteRefMaxAggregateInputType
  }

  export type GetPaqueteRefAggregateType<T extends PaqueteRefAggregateArgs> = {
        [P in keyof T & keyof AggregatePaqueteRef]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePaqueteRef[P]>
      : GetScalarType<T[P], AggregatePaqueteRef[P]>
  }




  export type PaqueteRefGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PaqueteRefWhereInput
    orderBy?: PaqueteRefOrderByWithAggregationInput | PaqueteRefOrderByWithAggregationInput[]
    by: PaqueteRefScalarFieldEnum[] | PaqueteRefScalarFieldEnum
    having?: PaqueteRefScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PaqueteRefCountAggregateInputType | true
    _avg?: PaqueteRefAvgAggregateInputType
    _sum?: PaqueteRefSumAggregateInputType
    _min?: PaqueteRefMinAggregateInputType
    _max?: PaqueteRefMaxAggregateInputType
  }

  export type PaqueteRefGroupByOutputType = {
    id: number
    nombre: string
    descripcion: string | null
    imagen: string | null
    categoria: string | null
    diasEstancia: number
    nochesBase: number
    incluyeBoleto: boolean
    precioBoleto: number | null
    precioSGL: number | null
    precioDBL: number | null
    precioTPL: number | null
    precioQUAD: number | null
    precioPorPersona: number | null
    destinoId: number | null
    _count: PaqueteRefCountAggregateOutputType | null
    _avg: PaqueteRefAvgAggregateOutputType | null
    _sum: PaqueteRefSumAggregateOutputType | null
    _min: PaqueteRefMinAggregateOutputType | null
    _max: PaqueteRefMaxAggregateOutputType | null
  }

  type GetPaqueteRefGroupByPayload<T extends PaqueteRefGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PaqueteRefGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PaqueteRefGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PaqueteRefGroupByOutputType[P]>
            : GetScalarType<T[P], PaqueteRefGroupByOutputType[P]>
        }
      >
    >


  export type PaqueteRefSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombre?: boolean
    descripcion?: boolean
    imagen?: boolean
    categoria?: boolean
    diasEstancia?: boolean
    nochesBase?: boolean
    incluyeBoleto?: boolean
    precioBoleto?: boolean
    precioSGL?: boolean
    precioDBL?: boolean
    precioTPL?: boolean
    precioQUAD?: boolean
    precioPorPersona?: boolean
    destinoId?: boolean
    destino?: boolean | PaqueteRef$destinoArgs<ExtArgs>
    cotizaciones?: boolean | PaqueteRef$cotizacionesArgs<ExtArgs>
    _count?: boolean | PaqueteRefCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["paqueteRef"]>

  export type PaqueteRefSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombre?: boolean
    descripcion?: boolean
    imagen?: boolean
    categoria?: boolean
    diasEstancia?: boolean
    nochesBase?: boolean
    incluyeBoleto?: boolean
    precioBoleto?: boolean
    precioSGL?: boolean
    precioDBL?: boolean
    precioTPL?: boolean
    precioQUAD?: boolean
    precioPorPersona?: boolean
    destinoId?: boolean
    destino?: boolean | PaqueteRef$destinoArgs<ExtArgs>
  }, ExtArgs["result"]["paqueteRef"]>

  export type PaqueteRefSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombre?: boolean
    descripcion?: boolean
    imagen?: boolean
    categoria?: boolean
    diasEstancia?: boolean
    nochesBase?: boolean
    incluyeBoleto?: boolean
    precioBoleto?: boolean
    precioSGL?: boolean
    precioDBL?: boolean
    precioTPL?: boolean
    precioQUAD?: boolean
    precioPorPersona?: boolean
    destinoId?: boolean
    destino?: boolean | PaqueteRef$destinoArgs<ExtArgs>
  }, ExtArgs["result"]["paqueteRef"]>

  export type PaqueteRefSelectScalar = {
    id?: boolean
    nombre?: boolean
    descripcion?: boolean
    imagen?: boolean
    categoria?: boolean
    diasEstancia?: boolean
    nochesBase?: boolean
    incluyeBoleto?: boolean
    precioBoleto?: boolean
    precioSGL?: boolean
    precioDBL?: boolean
    precioTPL?: boolean
    precioQUAD?: boolean
    precioPorPersona?: boolean
    destinoId?: boolean
  }

  export type PaqueteRefOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "nombre" | "descripcion" | "imagen" | "categoria" | "diasEstancia" | "nochesBase" | "incluyeBoleto" | "precioBoleto" | "precioSGL" | "precioDBL" | "precioTPL" | "precioQUAD" | "precioPorPersona" | "destinoId", ExtArgs["result"]["paqueteRef"]>
  export type PaqueteRefInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    destino?: boolean | PaqueteRef$destinoArgs<ExtArgs>
    cotizaciones?: boolean | PaqueteRef$cotizacionesArgs<ExtArgs>
    _count?: boolean | PaqueteRefCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PaqueteRefIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    destino?: boolean | PaqueteRef$destinoArgs<ExtArgs>
  }
  export type PaqueteRefIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    destino?: boolean | PaqueteRef$destinoArgs<ExtArgs>
  }

  export type $PaqueteRefPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PaqueteRef"
    objects: {
      destino: Prisma.$DestinoRefPayload<ExtArgs> | null
      cotizaciones: Prisma.$CotizacionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      nombre: string
      descripcion: string | null
      imagen: string | null
      categoria: string | null
      diasEstancia: number
      nochesBase: number
      incluyeBoleto: boolean
      precioBoleto: number | null
      precioSGL: number | null
      precioDBL: number | null
      precioTPL: number | null
      precioQUAD: number | null
      precioPorPersona: number | null
      destinoId: number | null
    }, ExtArgs["result"]["paqueteRef"]>
    composites: {}
  }

  type PaqueteRefGetPayload<S extends boolean | null | undefined | PaqueteRefDefaultArgs> = $Result.GetResult<Prisma.$PaqueteRefPayload, S>

  type PaqueteRefCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PaqueteRefFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PaqueteRefCountAggregateInputType | true
    }

  export interface PaqueteRefDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PaqueteRef'], meta: { name: 'PaqueteRef' } }
    /**
     * Find zero or one PaqueteRef that matches the filter.
     * @param {PaqueteRefFindUniqueArgs} args - Arguments to find a PaqueteRef
     * @example
     * // Get one PaqueteRef
     * const paqueteRef = await prisma.paqueteRef.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PaqueteRefFindUniqueArgs>(args: SelectSubset<T, PaqueteRefFindUniqueArgs<ExtArgs>>): Prisma__PaqueteRefClient<$Result.GetResult<Prisma.$PaqueteRefPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PaqueteRef that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PaqueteRefFindUniqueOrThrowArgs} args - Arguments to find a PaqueteRef
     * @example
     * // Get one PaqueteRef
     * const paqueteRef = await prisma.paqueteRef.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PaqueteRefFindUniqueOrThrowArgs>(args: SelectSubset<T, PaqueteRefFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PaqueteRefClient<$Result.GetResult<Prisma.$PaqueteRefPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PaqueteRef that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaqueteRefFindFirstArgs} args - Arguments to find a PaqueteRef
     * @example
     * // Get one PaqueteRef
     * const paqueteRef = await prisma.paqueteRef.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PaqueteRefFindFirstArgs>(args?: SelectSubset<T, PaqueteRefFindFirstArgs<ExtArgs>>): Prisma__PaqueteRefClient<$Result.GetResult<Prisma.$PaqueteRefPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PaqueteRef that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaqueteRefFindFirstOrThrowArgs} args - Arguments to find a PaqueteRef
     * @example
     * // Get one PaqueteRef
     * const paqueteRef = await prisma.paqueteRef.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PaqueteRefFindFirstOrThrowArgs>(args?: SelectSubset<T, PaqueteRefFindFirstOrThrowArgs<ExtArgs>>): Prisma__PaqueteRefClient<$Result.GetResult<Prisma.$PaqueteRefPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PaqueteRefs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaqueteRefFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PaqueteRefs
     * const paqueteRefs = await prisma.paqueteRef.findMany()
     * 
     * // Get first 10 PaqueteRefs
     * const paqueteRefs = await prisma.paqueteRef.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const paqueteRefWithIdOnly = await prisma.paqueteRef.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PaqueteRefFindManyArgs>(args?: SelectSubset<T, PaqueteRefFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaqueteRefPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PaqueteRef.
     * @param {PaqueteRefCreateArgs} args - Arguments to create a PaqueteRef.
     * @example
     * // Create one PaqueteRef
     * const PaqueteRef = await prisma.paqueteRef.create({
     *   data: {
     *     // ... data to create a PaqueteRef
     *   }
     * })
     * 
     */
    create<T extends PaqueteRefCreateArgs>(args: SelectSubset<T, PaqueteRefCreateArgs<ExtArgs>>): Prisma__PaqueteRefClient<$Result.GetResult<Prisma.$PaqueteRefPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PaqueteRefs.
     * @param {PaqueteRefCreateManyArgs} args - Arguments to create many PaqueteRefs.
     * @example
     * // Create many PaqueteRefs
     * const paqueteRef = await prisma.paqueteRef.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PaqueteRefCreateManyArgs>(args?: SelectSubset<T, PaqueteRefCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PaqueteRefs and returns the data saved in the database.
     * @param {PaqueteRefCreateManyAndReturnArgs} args - Arguments to create many PaqueteRefs.
     * @example
     * // Create many PaqueteRefs
     * const paqueteRef = await prisma.paqueteRef.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PaqueteRefs and only return the `id`
     * const paqueteRefWithIdOnly = await prisma.paqueteRef.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PaqueteRefCreateManyAndReturnArgs>(args?: SelectSubset<T, PaqueteRefCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaqueteRefPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PaqueteRef.
     * @param {PaqueteRefDeleteArgs} args - Arguments to delete one PaqueteRef.
     * @example
     * // Delete one PaqueteRef
     * const PaqueteRef = await prisma.paqueteRef.delete({
     *   where: {
     *     // ... filter to delete one PaqueteRef
     *   }
     * })
     * 
     */
    delete<T extends PaqueteRefDeleteArgs>(args: SelectSubset<T, PaqueteRefDeleteArgs<ExtArgs>>): Prisma__PaqueteRefClient<$Result.GetResult<Prisma.$PaqueteRefPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PaqueteRef.
     * @param {PaqueteRefUpdateArgs} args - Arguments to update one PaqueteRef.
     * @example
     * // Update one PaqueteRef
     * const paqueteRef = await prisma.paqueteRef.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PaqueteRefUpdateArgs>(args: SelectSubset<T, PaqueteRefUpdateArgs<ExtArgs>>): Prisma__PaqueteRefClient<$Result.GetResult<Prisma.$PaqueteRefPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PaqueteRefs.
     * @param {PaqueteRefDeleteManyArgs} args - Arguments to filter PaqueteRefs to delete.
     * @example
     * // Delete a few PaqueteRefs
     * const { count } = await prisma.paqueteRef.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PaqueteRefDeleteManyArgs>(args?: SelectSubset<T, PaqueteRefDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PaqueteRefs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaqueteRefUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PaqueteRefs
     * const paqueteRef = await prisma.paqueteRef.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PaqueteRefUpdateManyArgs>(args: SelectSubset<T, PaqueteRefUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PaqueteRefs and returns the data updated in the database.
     * @param {PaqueteRefUpdateManyAndReturnArgs} args - Arguments to update many PaqueteRefs.
     * @example
     * // Update many PaqueteRefs
     * const paqueteRef = await prisma.paqueteRef.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PaqueteRefs and only return the `id`
     * const paqueteRefWithIdOnly = await prisma.paqueteRef.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PaqueteRefUpdateManyAndReturnArgs>(args: SelectSubset<T, PaqueteRefUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PaqueteRefPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PaqueteRef.
     * @param {PaqueteRefUpsertArgs} args - Arguments to update or create a PaqueteRef.
     * @example
     * // Update or create a PaqueteRef
     * const paqueteRef = await prisma.paqueteRef.upsert({
     *   create: {
     *     // ... data to create a PaqueteRef
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PaqueteRef we want to update
     *   }
     * })
     */
    upsert<T extends PaqueteRefUpsertArgs>(args: SelectSubset<T, PaqueteRefUpsertArgs<ExtArgs>>): Prisma__PaqueteRefClient<$Result.GetResult<Prisma.$PaqueteRefPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PaqueteRefs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaqueteRefCountArgs} args - Arguments to filter PaqueteRefs to count.
     * @example
     * // Count the number of PaqueteRefs
     * const count = await prisma.paqueteRef.count({
     *   where: {
     *     // ... the filter for the PaqueteRefs we want to count
     *   }
     * })
    **/
    count<T extends PaqueteRefCountArgs>(
      args?: Subset<T, PaqueteRefCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PaqueteRefCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PaqueteRef.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaqueteRefAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PaqueteRefAggregateArgs>(args: Subset<T, PaqueteRefAggregateArgs>): Prisma.PrismaPromise<GetPaqueteRefAggregateType<T>>

    /**
     * Group by PaqueteRef.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PaqueteRefGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PaqueteRefGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PaqueteRefGroupByArgs['orderBy'] }
        : { orderBy?: PaqueteRefGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PaqueteRefGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPaqueteRefGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PaqueteRef model
   */
  readonly fields: PaqueteRefFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PaqueteRef.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PaqueteRefClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    destino<T extends PaqueteRef$destinoArgs<ExtArgs> = {}>(args?: Subset<T, PaqueteRef$destinoArgs<ExtArgs>>): Prisma__DestinoRefClient<$Result.GetResult<Prisma.$DestinoRefPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    cotizaciones<T extends PaqueteRef$cotizacionesArgs<ExtArgs> = {}>(args?: Subset<T, PaqueteRef$cotizacionesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PaqueteRef model
   */
  interface PaqueteRefFieldRefs {
    readonly id: FieldRef<"PaqueteRef", 'Int'>
    readonly nombre: FieldRef<"PaqueteRef", 'String'>
    readonly descripcion: FieldRef<"PaqueteRef", 'String'>
    readonly imagen: FieldRef<"PaqueteRef", 'String'>
    readonly categoria: FieldRef<"PaqueteRef", 'String'>
    readonly diasEstancia: FieldRef<"PaqueteRef", 'Int'>
    readonly nochesBase: FieldRef<"PaqueteRef", 'Int'>
    readonly incluyeBoleto: FieldRef<"PaqueteRef", 'Boolean'>
    readonly precioBoleto: FieldRef<"PaqueteRef", 'Float'>
    readonly precioSGL: FieldRef<"PaqueteRef", 'Float'>
    readonly precioDBL: FieldRef<"PaqueteRef", 'Float'>
    readonly precioTPL: FieldRef<"PaqueteRef", 'Float'>
    readonly precioQUAD: FieldRef<"PaqueteRef", 'Float'>
    readonly precioPorPersona: FieldRef<"PaqueteRef", 'Float'>
    readonly destinoId: FieldRef<"PaqueteRef", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * PaqueteRef findUnique
   */
  export type PaqueteRefFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PaqueteRef
     */
    select?: PaqueteRefSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PaqueteRef
     */
    omit?: PaqueteRefOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaqueteRefInclude<ExtArgs> | null
    /**
     * Filter, which PaqueteRef to fetch.
     */
    where: PaqueteRefWhereUniqueInput
  }

  /**
   * PaqueteRef findUniqueOrThrow
   */
  export type PaqueteRefFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PaqueteRef
     */
    select?: PaqueteRefSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PaqueteRef
     */
    omit?: PaqueteRefOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaqueteRefInclude<ExtArgs> | null
    /**
     * Filter, which PaqueteRef to fetch.
     */
    where: PaqueteRefWhereUniqueInput
  }

  /**
   * PaqueteRef findFirst
   */
  export type PaqueteRefFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PaqueteRef
     */
    select?: PaqueteRefSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PaqueteRef
     */
    omit?: PaqueteRefOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaqueteRefInclude<ExtArgs> | null
    /**
     * Filter, which PaqueteRef to fetch.
     */
    where?: PaqueteRefWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PaqueteRefs to fetch.
     */
    orderBy?: PaqueteRefOrderByWithRelationInput | PaqueteRefOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PaqueteRefs.
     */
    cursor?: PaqueteRefWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PaqueteRefs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PaqueteRefs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PaqueteRefs.
     */
    distinct?: PaqueteRefScalarFieldEnum | PaqueteRefScalarFieldEnum[]
  }

  /**
   * PaqueteRef findFirstOrThrow
   */
  export type PaqueteRefFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PaqueteRef
     */
    select?: PaqueteRefSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PaqueteRef
     */
    omit?: PaqueteRefOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaqueteRefInclude<ExtArgs> | null
    /**
     * Filter, which PaqueteRef to fetch.
     */
    where?: PaqueteRefWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PaqueteRefs to fetch.
     */
    orderBy?: PaqueteRefOrderByWithRelationInput | PaqueteRefOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PaqueteRefs.
     */
    cursor?: PaqueteRefWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PaqueteRefs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PaqueteRefs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PaqueteRefs.
     */
    distinct?: PaqueteRefScalarFieldEnum | PaqueteRefScalarFieldEnum[]
  }

  /**
   * PaqueteRef findMany
   */
  export type PaqueteRefFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PaqueteRef
     */
    select?: PaqueteRefSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PaqueteRef
     */
    omit?: PaqueteRefOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaqueteRefInclude<ExtArgs> | null
    /**
     * Filter, which PaqueteRefs to fetch.
     */
    where?: PaqueteRefWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PaqueteRefs to fetch.
     */
    orderBy?: PaqueteRefOrderByWithRelationInput | PaqueteRefOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PaqueteRefs.
     */
    cursor?: PaqueteRefWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PaqueteRefs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PaqueteRefs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PaqueteRefs.
     */
    distinct?: PaqueteRefScalarFieldEnum | PaqueteRefScalarFieldEnum[]
  }

  /**
   * PaqueteRef create
   */
  export type PaqueteRefCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PaqueteRef
     */
    select?: PaqueteRefSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PaqueteRef
     */
    omit?: PaqueteRefOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaqueteRefInclude<ExtArgs> | null
    /**
     * The data needed to create a PaqueteRef.
     */
    data: XOR<PaqueteRefCreateInput, PaqueteRefUncheckedCreateInput>
  }

  /**
   * PaqueteRef createMany
   */
  export type PaqueteRefCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PaqueteRefs.
     */
    data: PaqueteRefCreateManyInput | PaqueteRefCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PaqueteRef createManyAndReturn
   */
  export type PaqueteRefCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PaqueteRef
     */
    select?: PaqueteRefSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PaqueteRef
     */
    omit?: PaqueteRefOmit<ExtArgs> | null
    /**
     * The data used to create many PaqueteRefs.
     */
    data: PaqueteRefCreateManyInput | PaqueteRefCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaqueteRefIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PaqueteRef update
   */
  export type PaqueteRefUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PaqueteRef
     */
    select?: PaqueteRefSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PaqueteRef
     */
    omit?: PaqueteRefOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaqueteRefInclude<ExtArgs> | null
    /**
     * The data needed to update a PaqueteRef.
     */
    data: XOR<PaqueteRefUpdateInput, PaqueteRefUncheckedUpdateInput>
    /**
     * Choose, which PaqueteRef to update.
     */
    where: PaqueteRefWhereUniqueInput
  }

  /**
   * PaqueteRef updateMany
   */
  export type PaqueteRefUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PaqueteRefs.
     */
    data: XOR<PaqueteRefUpdateManyMutationInput, PaqueteRefUncheckedUpdateManyInput>
    /**
     * Filter which PaqueteRefs to update
     */
    where?: PaqueteRefWhereInput
    /**
     * Limit how many PaqueteRefs to update.
     */
    limit?: number
  }

  /**
   * PaqueteRef updateManyAndReturn
   */
  export type PaqueteRefUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PaqueteRef
     */
    select?: PaqueteRefSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PaqueteRef
     */
    omit?: PaqueteRefOmit<ExtArgs> | null
    /**
     * The data used to update PaqueteRefs.
     */
    data: XOR<PaqueteRefUpdateManyMutationInput, PaqueteRefUncheckedUpdateManyInput>
    /**
     * Filter which PaqueteRefs to update
     */
    where?: PaqueteRefWhereInput
    /**
     * Limit how many PaqueteRefs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaqueteRefIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * PaqueteRef upsert
   */
  export type PaqueteRefUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PaqueteRef
     */
    select?: PaqueteRefSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PaqueteRef
     */
    omit?: PaqueteRefOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaqueteRefInclude<ExtArgs> | null
    /**
     * The filter to search for the PaqueteRef to update in case it exists.
     */
    where: PaqueteRefWhereUniqueInput
    /**
     * In case the PaqueteRef found by the `where` argument doesn't exist, create a new PaqueteRef with this data.
     */
    create: XOR<PaqueteRefCreateInput, PaqueteRefUncheckedCreateInput>
    /**
     * In case the PaqueteRef was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PaqueteRefUpdateInput, PaqueteRefUncheckedUpdateInput>
  }

  /**
   * PaqueteRef delete
   */
  export type PaqueteRefDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PaqueteRef
     */
    select?: PaqueteRefSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PaqueteRef
     */
    omit?: PaqueteRefOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaqueteRefInclude<ExtArgs> | null
    /**
     * Filter which PaqueteRef to delete.
     */
    where: PaqueteRefWhereUniqueInput
  }

  /**
   * PaqueteRef deleteMany
   */
  export type PaqueteRefDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PaqueteRefs to delete
     */
    where?: PaqueteRefWhereInput
    /**
     * Limit how many PaqueteRefs to delete.
     */
    limit?: number
  }

  /**
   * PaqueteRef.destino
   */
  export type PaqueteRef$destinoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DestinoRef
     */
    select?: DestinoRefSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DestinoRef
     */
    omit?: DestinoRefOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DestinoRefInclude<ExtArgs> | null
    where?: DestinoRefWhereInput
  }

  /**
   * PaqueteRef.cotizaciones
   */
  export type PaqueteRef$cotizacionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cotizacion
     */
    omit?: CotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    where?: CotizacionWhereInput
    orderBy?: CotizacionOrderByWithRelationInput | CotizacionOrderByWithRelationInput[]
    cursor?: CotizacionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CotizacionScalarFieldEnum | CotizacionScalarFieldEnum[]
  }

  /**
   * PaqueteRef without action
   */
  export type PaqueteRefDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PaqueteRef
     */
    select?: PaqueteRefSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PaqueteRef
     */
    omit?: PaqueteRefOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PaqueteRefInclude<ExtArgs> | null
  }


  /**
   * Model Cliente
   */

  export type AggregateCliente = {
    _count: ClienteCountAggregateOutputType | null
    _min: ClienteMinAggregateOutputType | null
    _max: ClienteMaxAggregateOutputType | null
  }

  export type ClienteMinAggregateOutputType = {
    id: string | null
    agenciaId: string | null
    nombre: string | null
    email: string | null
    telefono: string | null
    documento: string | null
    direccion: string | null
    fechaAlta: Date | null
  }

  export type ClienteMaxAggregateOutputType = {
    id: string | null
    agenciaId: string | null
    nombre: string | null
    email: string | null
    telefono: string | null
    documento: string | null
    direccion: string | null
    fechaAlta: Date | null
  }

  export type ClienteCountAggregateOutputType = {
    id: number
    agenciaId: number
    nombre: number
    email: number
    telefono: number
    documento: number
    direccion: number
    fechaAlta: number
    _all: number
  }


  export type ClienteMinAggregateInputType = {
    id?: true
    agenciaId?: true
    nombre?: true
    email?: true
    telefono?: true
    documento?: true
    direccion?: true
    fechaAlta?: true
  }

  export type ClienteMaxAggregateInputType = {
    id?: true
    agenciaId?: true
    nombre?: true
    email?: true
    telefono?: true
    documento?: true
    direccion?: true
    fechaAlta?: true
  }

  export type ClienteCountAggregateInputType = {
    id?: true
    agenciaId?: true
    nombre?: true
    email?: true
    telefono?: true
    documento?: true
    direccion?: true
    fechaAlta?: true
    _all?: true
  }

  export type ClienteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Cliente to aggregate.
     */
    where?: ClienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clientes to fetch.
     */
    orderBy?: ClienteOrderByWithRelationInput | ClienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ClienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clientes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Clientes
    **/
    _count?: true | ClienteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ClienteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ClienteMaxAggregateInputType
  }

  export type GetClienteAggregateType<T extends ClienteAggregateArgs> = {
        [P in keyof T & keyof AggregateCliente]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCliente[P]>
      : GetScalarType<T[P], AggregateCliente[P]>
  }




  export type ClienteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClienteWhereInput
    orderBy?: ClienteOrderByWithAggregationInput | ClienteOrderByWithAggregationInput[]
    by: ClienteScalarFieldEnum[] | ClienteScalarFieldEnum
    having?: ClienteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ClienteCountAggregateInputType | true
    _min?: ClienteMinAggregateInputType
    _max?: ClienteMaxAggregateInputType
  }

  export type ClienteGroupByOutputType = {
    id: string
    agenciaId: string
    nombre: string
    email: string | null
    telefono: string | null
    documento: string | null
    direccion: string | null
    fechaAlta: Date
    _count: ClienteCountAggregateOutputType | null
    _min: ClienteMinAggregateOutputType | null
    _max: ClienteMaxAggregateOutputType | null
  }

  type GetClienteGroupByPayload<T extends ClienteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ClienteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ClienteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ClienteGroupByOutputType[P]>
            : GetScalarType<T[P], ClienteGroupByOutputType[P]>
        }
      >
    >


  export type ClienteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    agenciaId?: boolean
    nombre?: boolean
    email?: boolean
    telefono?: boolean
    documento?: boolean
    direccion?: boolean
    fechaAlta?: boolean
    agencia?: boolean | AgenciaDefaultArgs<ExtArgs>
    cotizaciones?: boolean | Cliente$cotizacionesArgs<ExtArgs>
    _count?: boolean | ClienteCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cliente"]>

  export type ClienteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    agenciaId?: boolean
    nombre?: boolean
    email?: boolean
    telefono?: boolean
    documento?: boolean
    direccion?: boolean
    fechaAlta?: boolean
    agencia?: boolean | AgenciaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cliente"]>

  export type ClienteSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    agenciaId?: boolean
    nombre?: boolean
    email?: boolean
    telefono?: boolean
    documento?: boolean
    direccion?: boolean
    fechaAlta?: boolean
    agencia?: boolean | AgenciaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cliente"]>

  export type ClienteSelectScalar = {
    id?: boolean
    agenciaId?: boolean
    nombre?: boolean
    email?: boolean
    telefono?: boolean
    documento?: boolean
    direccion?: boolean
    fechaAlta?: boolean
  }

  export type ClienteOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "agenciaId" | "nombre" | "email" | "telefono" | "documento" | "direccion" | "fechaAlta", ExtArgs["result"]["cliente"]>
  export type ClienteInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    agencia?: boolean | AgenciaDefaultArgs<ExtArgs>
    cotizaciones?: boolean | Cliente$cotizacionesArgs<ExtArgs>
    _count?: boolean | ClienteCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ClienteIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    agencia?: boolean | AgenciaDefaultArgs<ExtArgs>
  }
  export type ClienteIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    agencia?: boolean | AgenciaDefaultArgs<ExtArgs>
  }

  export type $ClientePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Cliente"
    objects: {
      agencia: Prisma.$AgenciaPayload<ExtArgs>
      cotizaciones: Prisma.$CotizacionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      agenciaId: string
      nombre: string
      email: string | null
      telefono: string | null
      documento: string | null
      direccion: string | null
      fechaAlta: Date
    }, ExtArgs["result"]["cliente"]>
    composites: {}
  }

  type ClienteGetPayload<S extends boolean | null | undefined | ClienteDefaultArgs> = $Result.GetResult<Prisma.$ClientePayload, S>

  type ClienteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ClienteFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ClienteCountAggregateInputType | true
    }

  export interface ClienteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Cliente'], meta: { name: 'Cliente' } }
    /**
     * Find zero or one Cliente that matches the filter.
     * @param {ClienteFindUniqueArgs} args - Arguments to find a Cliente
     * @example
     * // Get one Cliente
     * const cliente = await prisma.cliente.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ClienteFindUniqueArgs>(args: SelectSubset<T, ClienteFindUniqueArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Cliente that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ClienteFindUniqueOrThrowArgs} args - Arguments to find a Cliente
     * @example
     * // Get one Cliente
     * const cliente = await prisma.cliente.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ClienteFindUniqueOrThrowArgs>(args: SelectSubset<T, ClienteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Cliente that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteFindFirstArgs} args - Arguments to find a Cliente
     * @example
     * // Get one Cliente
     * const cliente = await prisma.cliente.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ClienteFindFirstArgs>(args?: SelectSubset<T, ClienteFindFirstArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Cliente that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteFindFirstOrThrowArgs} args - Arguments to find a Cliente
     * @example
     * // Get one Cliente
     * const cliente = await prisma.cliente.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ClienteFindFirstOrThrowArgs>(args?: SelectSubset<T, ClienteFindFirstOrThrowArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Clientes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Clientes
     * const clientes = await prisma.cliente.findMany()
     * 
     * // Get first 10 Clientes
     * const clientes = await prisma.cliente.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const clienteWithIdOnly = await prisma.cliente.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ClienteFindManyArgs>(args?: SelectSubset<T, ClienteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Cliente.
     * @param {ClienteCreateArgs} args - Arguments to create a Cliente.
     * @example
     * // Create one Cliente
     * const Cliente = await prisma.cliente.create({
     *   data: {
     *     // ... data to create a Cliente
     *   }
     * })
     * 
     */
    create<T extends ClienteCreateArgs>(args: SelectSubset<T, ClienteCreateArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Clientes.
     * @param {ClienteCreateManyArgs} args - Arguments to create many Clientes.
     * @example
     * // Create many Clientes
     * const cliente = await prisma.cliente.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ClienteCreateManyArgs>(args?: SelectSubset<T, ClienteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Clientes and returns the data saved in the database.
     * @param {ClienteCreateManyAndReturnArgs} args - Arguments to create many Clientes.
     * @example
     * // Create many Clientes
     * const cliente = await prisma.cliente.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Clientes and only return the `id`
     * const clienteWithIdOnly = await prisma.cliente.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ClienteCreateManyAndReturnArgs>(args?: SelectSubset<T, ClienteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Cliente.
     * @param {ClienteDeleteArgs} args - Arguments to delete one Cliente.
     * @example
     * // Delete one Cliente
     * const Cliente = await prisma.cliente.delete({
     *   where: {
     *     // ... filter to delete one Cliente
     *   }
     * })
     * 
     */
    delete<T extends ClienteDeleteArgs>(args: SelectSubset<T, ClienteDeleteArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Cliente.
     * @param {ClienteUpdateArgs} args - Arguments to update one Cliente.
     * @example
     * // Update one Cliente
     * const cliente = await prisma.cliente.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ClienteUpdateArgs>(args: SelectSubset<T, ClienteUpdateArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Clientes.
     * @param {ClienteDeleteManyArgs} args - Arguments to filter Clientes to delete.
     * @example
     * // Delete a few Clientes
     * const { count } = await prisma.cliente.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ClienteDeleteManyArgs>(args?: SelectSubset<T, ClienteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Clientes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Clientes
     * const cliente = await prisma.cliente.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ClienteUpdateManyArgs>(args: SelectSubset<T, ClienteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Clientes and returns the data updated in the database.
     * @param {ClienteUpdateManyAndReturnArgs} args - Arguments to update many Clientes.
     * @example
     * // Update many Clientes
     * const cliente = await prisma.cliente.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Clientes and only return the `id`
     * const clienteWithIdOnly = await prisma.cliente.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ClienteUpdateManyAndReturnArgs>(args: SelectSubset<T, ClienteUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Cliente.
     * @param {ClienteUpsertArgs} args - Arguments to update or create a Cliente.
     * @example
     * // Update or create a Cliente
     * const cliente = await prisma.cliente.upsert({
     *   create: {
     *     // ... data to create a Cliente
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Cliente we want to update
     *   }
     * })
     */
    upsert<T extends ClienteUpsertArgs>(args: SelectSubset<T, ClienteUpsertArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Clientes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteCountArgs} args - Arguments to filter Clientes to count.
     * @example
     * // Count the number of Clientes
     * const count = await prisma.cliente.count({
     *   where: {
     *     // ... the filter for the Clientes we want to count
     *   }
     * })
    **/
    count<T extends ClienteCountArgs>(
      args?: Subset<T, ClienteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ClienteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Cliente.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ClienteAggregateArgs>(args: Subset<T, ClienteAggregateArgs>): Prisma.PrismaPromise<GetClienteAggregateType<T>>

    /**
     * Group by Cliente.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ClienteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ClienteGroupByArgs['orderBy'] }
        : { orderBy?: ClienteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ClienteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClienteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Cliente model
   */
  readonly fields: ClienteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Cliente.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ClienteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    agencia<T extends AgenciaDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AgenciaDefaultArgs<ExtArgs>>): Prisma__AgenciaClient<$Result.GetResult<Prisma.$AgenciaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    cotizaciones<T extends Cliente$cotizacionesArgs<ExtArgs> = {}>(args?: Subset<T, Cliente$cotizacionesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Cliente model
   */
  interface ClienteFieldRefs {
    readonly id: FieldRef<"Cliente", 'String'>
    readonly agenciaId: FieldRef<"Cliente", 'String'>
    readonly nombre: FieldRef<"Cliente", 'String'>
    readonly email: FieldRef<"Cliente", 'String'>
    readonly telefono: FieldRef<"Cliente", 'String'>
    readonly documento: FieldRef<"Cliente", 'String'>
    readonly direccion: FieldRef<"Cliente", 'String'>
    readonly fechaAlta: FieldRef<"Cliente", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Cliente findUnique
   */
  export type ClienteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * Filter, which Cliente to fetch.
     */
    where: ClienteWhereUniqueInput
  }

  /**
   * Cliente findUniqueOrThrow
   */
  export type ClienteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * Filter, which Cliente to fetch.
     */
    where: ClienteWhereUniqueInput
  }

  /**
   * Cliente findFirst
   */
  export type ClienteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * Filter, which Cliente to fetch.
     */
    where?: ClienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clientes to fetch.
     */
    orderBy?: ClienteOrderByWithRelationInput | ClienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Clientes.
     */
    cursor?: ClienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clientes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Clientes.
     */
    distinct?: ClienteScalarFieldEnum | ClienteScalarFieldEnum[]
  }

  /**
   * Cliente findFirstOrThrow
   */
  export type ClienteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * Filter, which Cliente to fetch.
     */
    where?: ClienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clientes to fetch.
     */
    orderBy?: ClienteOrderByWithRelationInput | ClienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Clientes.
     */
    cursor?: ClienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clientes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Clientes.
     */
    distinct?: ClienteScalarFieldEnum | ClienteScalarFieldEnum[]
  }

  /**
   * Cliente findMany
   */
  export type ClienteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * Filter, which Clientes to fetch.
     */
    where?: ClienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clientes to fetch.
     */
    orderBy?: ClienteOrderByWithRelationInput | ClienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Clientes.
     */
    cursor?: ClienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clientes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Clientes.
     */
    distinct?: ClienteScalarFieldEnum | ClienteScalarFieldEnum[]
  }

  /**
   * Cliente create
   */
  export type ClienteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * The data needed to create a Cliente.
     */
    data: XOR<ClienteCreateInput, ClienteUncheckedCreateInput>
  }

  /**
   * Cliente createMany
   */
  export type ClienteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Clientes.
     */
    data: ClienteCreateManyInput | ClienteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Cliente createManyAndReturn
   */
  export type ClienteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * The data used to create many Clientes.
     */
    data: ClienteCreateManyInput | ClienteCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Cliente update
   */
  export type ClienteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * The data needed to update a Cliente.
     */
    data: XOR<ClienteUpdateInput, ClienteUncheckedUpdateInput>
    /**
     * Choose, which Cliente to update.
     */
    where: ClienteWhereUniqueInput
  }

  /**
   * Cliente updateMany
   */
  export type ClienteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Clientes.
     */
    data: XOR<ClienteUpdateManyMutationInput, ClienteUncheckedUpdateManyInput>
    /**
     * Filter which Clientes to update
     */
    where?: ClienteWhereInput
    /**
     * Limit how many Clientes to update.
     */
    limit?: number
  }

  /**
   * Cliente updateManyAndReturn
   */
  export type ClienteUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * The data used to update Clientes.
     */
    data: XOR<ClienteUpdateManyMutationInput, ClienteUncheckedUpdateManyInput>
    /**
     * Filter which Clientes to update
     */
    where?: ClienteWhereInput
    /**
     * Limit how many Clientes to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Cliente upsert
   */
  export type ClienteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * The filter to search for the Cliente to update in case it exists.
     */
    where: ClienteWhereUniqueInput
    /**
     * In case the Cliente found by the `where` argument doesn't exist, create a new Cliente with this data.
     */
    create: XOR<ClienteCreateInput, ClienteUncheckedCreateInput>
    /**
     * In case the Cliente was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ClienteUpdateInput, ClienteUncheckedUpdateInput>
  }

  /**
   * Cliente delete
   */
  export type ClienteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * Filter which Cliente to delete.
     */
    where: ClienteWhereUniqueInput
  }

  /**
   * Cliente deleteMany
   */
  export type ClienteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Clientes to delete
     */
    where?: ClienteWhereInput
    /**
     * Limit how many Clientes to delete.
     */
    limit?: number
  }

  /**
   * Cliente.cotizaciones
   */
  export type Cliente$cotizacionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cotizacion
     */
    omit?: CotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    where?: CotizacionWhereInput
    orderBy?: CotizacionOrderByWithRelationInput | CotizacionOrderByWithRelationInput[]
    cursor?: CotizacionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CotizacionScalarFieldEnum | CotizacionScalarFieldEnum[]
  }

  /**
   * Cliente without action
   */
  export type ClienteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
  }


  /**
   * Model Cotizacion
   */

  export type AggregateCotizacion = {
    _count: CotizacionCountAggregateOutputType | null
    _avg: CotizacionAvgAggregateOutputType | null
    _sum: CotizacionSumAggregateOutputType | null
    _min: CotizacionMinAggregateOutputType | null
    _max: CotizacionMaxAggregateOutputType | null
  }

  export type CotizacionAvgAggregateOutputType = {
    paqueteId: number | null
    cantSGL: number | null
    cantDBL: number | null
    cantTPL: number | null
    cantQUAD: number | null
    cantCHD: number | null
    precioSGL: number | null
    precioDBL: number | null
    precioTPL: number | null
    precioQUAD: number | null
    precioCHD: number | null
    precioBoleto: number | null
    subtotal: number | null
    markup: number | null
    total: number | null
  }

  export type CotizacionSumAggregateOutputType = {
    paqueteId: number | null
    cantSGL: number | null
    cantDBL: number | null
    cantTPL: number | null
    cantQUAD: number | null
    cantCHD: number | null
    precioSGL: number | null
    precioDBL: number | null
    precioTPL: number | null
    precioQUAD: number | null
    precioCHD: number | null
    precioBoleto: number | null
    subtotal: number | null
    markup: number | null
    total: number | null
  }

  export type CotizacionMinAggregateOutputType = {
    id: string | null
    codigo: string | null
    agenciaId: string | null
    creadoPorId: string | null
    paqueteId: number | null
    clienteId: string | null
    paqueteNombre: string | null
    paqueteDuracion: string | null
    paqueteDestino: string | null
    incluyeBoleto: boolean | null
    cantSGL: number | null
    cantDBL: number | null
    cantTPL: number | null
    cantQUAD: number | null
    cantCHD: number | null
    precioSGL: number | null
    precioDBL: number | null
    precioTPL: number | null
    precioQUAD: number | null
    precioCHD: number | null
    precioBoleto: number | null
    subtotal: number | null
    markup: number | null
    total: number | null
    fechaViaje: Date | null
    fechaRetorno: Date | null
    status: $Enums.CotizacionStatus | null
    notas: string | null
    tokenAprobacion: string | null
    fechaCreacion: Date | null
    fechaEnvio: Date | null
    fechaAprobacion: Date | null
    fechaVencimiento: Date | null
  }

  export type CotizacionMaxAggregateOutputType = {
    id: string | null
    codigo: string | null
    agenciaId: string | null
    creadoPorId: string | null
    paqueteId: number | null
    clienteId: string | null
    paqueteNombre: string | null
    paqueteDuracion: string | null
    paqueteDestino: string | null
    incluyeBoleto: boolean | null
    cantSGL: number | null
    cantDBL: number | null
    cantTPL: number | null
    cantQUAD: number | null
    cantCHD: number | null
    precioSGL: number | null
    precioDBL: number | null
    precioTPL: number | null
    precioQUAD: number | null
    precioCHD: number | null
    precioBoleto: number | null
    subtotal: number | null
    markup: number | null
    total: number | null
    fechaViaje: Date | null
    fechaRetorno: Date | null
    status: $Enums.CotizacionStatus | null
    notas: string | null
    tokenAprobacion: string | null
    fechaCreacion: Date | null
    fechaEnvio: Date | null
    fechaAprobacion: Date | null
    fechaVencimiento: Date | null
  }

  export type CotizacionCountAggregateOutputType = {
    id: number
    codigo: number
    agenciaId: number
    creadoPorId: number
    paqueteId: number
    clienteId: number
    paqueteNombre: number
    paqueteDuracion: number
    paqueteDestino: number
    paqueteIncluye: number
    incluyeBoleto: number
    cantSGL: number
    cantDBL: number
    cantTPL: number
    cantQUAD: number
    cantCHD: number
    precioSGL: number
    precioDBL: number
    precioTPL: number
    precioQUAD: number
    precioCHD: number
    precioBoleto: number
    subtotal: number
    markup: number
    total: number
    fechaViaje: number
    fechaRetorno: number
    status: number
    notas: number
    tokenAprobacion: number
    fechaCreacion: number
    fechaEnvio: number
    fechaAprobacion: number
    fechaVencimiento: number
    _all: number
  }


  export type CotizacionAvgAggregateInputType = {
    paqueteId?: true
    cantSGL?: true
    cantDBL?: true
    cantTPL?: true
    cantQUAD?: true
    cantCHD?: true
    precioSGL?: true
    precioDBL?: true
    precioTPL?: true
    precioQUAD?: true
    precioCHD?: true
    precioBoleto?: true
    subtotal?: true
    markup?: true
    total?: true
  }

  export type CotizacionSumAggregateInputType = {
    paqueteId?: true
    cantSGL?: true
    cantDBL?: true
    cantTPL?: true
    cantQUAD?: true
    cantCHD?: true
    precioSGL?: true
    precioDBL?: true
    precioTPL?: true
    precioQUAD?: true
    precioCHD?: true
    precioBoleto?: true
    subtotal?: true
    markup?: true
    total?: true
  }

  export type CotizacionMinAggregateInputType = {
    id?: true
    codigo?: true
    agenciaId?: true
    creadoPorId?: true
    paqueteId?: true
    clienteId?: true
    paqueteNombre?: true
    paqueteDuracion?: true
    paqueteDestino?: true
    incluyeBoleto?: true
    cantSGL?: true
    cantDBL?: true
    cantTPL?: true
    cantQUAD?: true
    cantCHD?: true
    precioSGL?: true
    precioDBL?: true
    precioTPL?: true
    precioQUAD?: true
    precioCHD?: true
    precioBoleto?: true
    subtotal?: true
    markup?: true
    total?: true
    fechaViaje?: true
    fechaRetorno?: true
    status?: true
    notas?: true
    tokenAprobacion?: true
    fechaCreacion?: true
    fechaEnvio?: true
    fechaAprobacion?: true
    fechaVencimiento?: true
  }

  export type CotizacionMaxAggregateInputType = {
    id?: true
    codigo?: true
    agenciaId?: true
    creadoPorId?: true
    paqueteId?: true
    clienteId?: true
    paqueteNombre?: true
    paqueteDuracion?: true
    paqueteDestino?: true
    incluyeBoleto?: true
    cantSGL?: true
    cantDBL?: true
    cantTPL?: true
    cantQUAD?: true
    cantCHD?: true
    precioSGL?: true
    precioDBL?: true
    precioTPL?: true
    precioQUAD?: true
    precioCHD?: true
    precioBoleto?: true
    subtotal?: true
    markup?: true
    total?: true
    fechaViaje?: true
    fechaRetorno?: true
    status?: true
    notas?: true
    tokenAprobacion?: true
    fechaCreacion?: true
    fechaEnvio?: true
    fechaAprobacion?: true
    fechaVencimiento?: true
  }

  export type CotizacionCountAggregateInputType = {
    id?: true
    codigo?: true
    agenciaId?: true
    creadoPorId?: true
    paqueteId?: true
    clienteId?: true
    paqueteNombre?: true
    paqueteDuracion?: true
    paqueteDestino?: true
    paqueteIncluye?: true
    incluyeBoleto?: true
    cantSGL?: true
    cantDBL?: true
    cantTPL?: true
    cantQUAD?: true
    cantCHD?: true
    precioSGL?: true
    precioDBL?: true
    precioTPL?: true
    precioQUAD?: true
    precioCHD?: true
    precioBoleto?: true
    subtotal?: true
    markup?: true
    total?: true
    fechaViaje?: true
    fechaRetorno?: true
    status?: true
    notas?: true
    tokenAprobacion?: true
    fechaCreacion?: true
    fechaEnvio?: true
    fechaAprobacion?: true
    fechaVencimiento?: true
    _all?: true
  }

  export type CotizacionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Cotizacion to aggregate.
     */
    where?: CotizacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cotizacions to fetch.
     */
    orderBy?: CotizacionOrderByWithRelationInput | CotizacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CotizacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cotizacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cotizacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Cotizacions
    **/
    _count?: true | CotizacionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CotizacionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CotizacionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CotizacionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CotizacionMaxAggregateInputType
  }

  export type GetCotizacionAggregateType<T extends CotizacionAggregateArgs> = {
        [P in keyof T & keyof AggregateCotizacion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCotizacion[P]>
      : GetScalarType<T[P], AggregateCotizacion[P]>
  }




  export type CotizacionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CotizacionWhereInput
    orderBy?: CotizacionOrderByWithAggregationInput | CotizacionOrderByWithAggregationInput[]
    by: CotizacionScalarFieldEnum[] | CotizacionScalarFieldEnum
    having?: CotizacionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CotizacionCountAggregateInputType | true
    _avg?: CotizacionAvgAggregateInputType
    _sum?: CotizacionSumAggregateInputType
    _min?: CotizacionMinAggregateInputType
    _max?: CotizacionMaxAggregateInputType
  }

  export type CotizacionGroupByOutputType = {
    id: string
    codigo: string
    agenciaId: string
    creadoPorId: string
    paqueteId: number
    clienteId: string
    paqueteNombre: string
    paqueteDuracion: string
    paqueteDestino: string
    paqueteIncluye: string[]
    incluyeBoleto: boolean
    cantSGL: number
    cantDBL: number
    cantTPL: number
    cantQUAD: number
    cantCHD: number
    precioSGL: number | null
    precioDBL: number | null
    precioTPL: number | null
    precioQUAD: number | null
    precioCHD: number | null
    precioBoleto: number | null
    subtotal: number
    markup: number
    total: number
    fechaViaje: Date | null
    fechaRetorno: Date | null
    status: $Enums.CotizacionStatus
    notas: string | null
    tokenAprobacion: string | null
    fechaCreacion: Date
    fechaEnvio: Date | null
    fechaAprobacion: Date | null
    fechaVencimiento: Date | null
    _count: CotizacionCountAggregateOutputType | null
    _avg: CotizacionAvgAggregateOutputType | null
    _sum: CotizacionSumAggregateOutputType | null
    _min: CotizacionMinAggregateOutputType | null
    _max: CotizacionMaxAggregateOutputType | null
  }

  type GetCotizacionGroupByPayload<T extends CotizacionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CotizacionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CotizacionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CotizacionGroupByOutputType[P]>
            : GetScalarType<T[P], CotizacionGroupByOutputType[P]>
        }
      >
    >


  export type CotizacionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    codigo?: boolean
    agenciaId?: boolean
    creadoPorId?: boolean
    paqueteId?: boolean
    clienteId?: boolean
    paqueteNombre?: boolean
    paqueteDuracion?: boolean
    paqueteDestino?: boolean
    paqueteIncluye?: boolean
    incluyeBoleto?: boolean
    cantSGL?: boolean
    cantDBL?: boolean
    cantTPL?: boolean
    cantQUAD?: boolean
    cantCHD?: boolean
    precioSGL?: boolean
    precioDBL?: boolean
    precioTPL?: boolean
    precioQUAD?: boolean
    precioCHD?: boolean
    precioBoleto?: boolean
    subtotal?: boolean
    markup?: boolean
    total?: boolean
    fechaViaje?: boolean
    fechaRetorno?: boolean
    status?: boolean
    notas?: boolean
    tokenAprobacion?: boolean
    fechaCreacion?: boolean
    fechaEnvio?: boolean
    fechaAprobacion?: boolean
    fechaVencimiento?: boolean
    agencia?: boolean | AgenciaDefaultArgs<ExtArgs>
    creadoPor?: boolean | UsuarioAgenciaDefaultArgs<ExtArgs>
    paquete?: boolean | PaqueteRefDefaultArgs<ExtArgs>
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    historial?: boolean | Cotizacion$historialArgs<ExtArgs>
    _count?: boolean | CotizacionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cotizacion"]>

  export type CotizacionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    codigo?: boolean
    agenciaId?: boolean
    creadoPorId?: boolean
    paqueteId?: boolean
    clienteId?: boolean
    paqueteNombre?: boolean
    paqueteDuracion?: boolean
    paqueteDestino?: boolean
    paqueteIncluye?: boolean
    incluyeBoleto?: boolean
    cantSGL?: boolean
    cantDBL?: boolean
    cantTPL?: boolean
    cantQUAD?: boolean
    cantCHD?: boolean
    precioSGL?: boolean
    precioDBL?: boolean
    precioTPL?: boolean
    precioQUAD?: boolean
    precioCHD?: boolean
    precioBoleto?: boolean
    subtotal?: boolean
    markup?: boolean
    total?: boolean
    fechaViaje?: boolean
    fechaRetorno?: boolean
    status?: boolean
    notas?: boolean
    tokenAprobacion?: boolean
    fechaCreacion?: boolean
    fechaEnvio?: boolean
    fechaAprobacion?: boolean
    fechaVencimiento?: boolean
    agencia?: boolean | AgenciaDefaultArgs<ExtArgs>
    creadoPor?: boolean | UsuarioAgenciaDefaultArgs<ExtArgs>
    paquete?: boolean | PaqueteRefDefaultArgs<ExtArgs>
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cotizacion"]>

  export type CotizacionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    codigo?: boolean
    agenciaId?: boolean
    creadoPorId?: boolean
    paqueteId?: boolean
    clienteId?: boolean
    paqueteNombre?: boolean
    paqueteDuracion?: boolean
    paqueteDestino?: boolean
    paqueteIncluye?: boolean
    incluyeBoleto?: boolean
    cantSGL?: boolean
    cantDBL?: boolean
    cantTPL?: boolean
    cantQUAD?: boolean
    cantCHD?: boolean
    precioSGL?: boolean
    precioDBL?: boolean
    precioTPL?: boolean
    precioQUAD?: boolean
    precioCHD?: boolean
    precioBoleto?: boolean
    subtotal?: boolean
    markup?: boolean
    total?: boolean
    fechaViaje?: boolean
    fechaRetorno?: boolean
    status?: boolean
    notas?: boolean
    tokenAprobacion?: boolean
    fechaCreacion?: boolean
    fechaEnvio?: boolean
    fechaAprobacion?: boolean
    fechaVencimiento?: boolean
    agencia?: boolean | AgenciaDefaultArgs<ExtArgs>
    creadoPor?: boolean | UsuarioAgenciaDefaultArgs<ExtArgs>
    paquete?: boolean | PaqueteRefDefaultArgs<ExtArgs>
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cotizacion"]>

  export type CotizacionSelectScalar = {
    id?: boolean
    codigo?: boolean
    agenciaId?: boolean
    creadoPorId?: boolean
    paqueteId?: boolean
    clienteId?: boolean
    paqueteNombre?: boolean
    paqueteDuracion?: boolean
    paqueteDestino?: boolean
    paqueteIncluye?: boolean
    incluyeBoleto?: boolean
    cantSGL?: boolean
    cantDBL?: boolean
    cantTPL?: boolean
    cantQUAD?: boolean
    cantCHD?: boolean
    precioSGL?: boolean
    precioDBL?: boolean
    precioTPL?: boolean
    precioQUAD?: boolean
    precioCHD?: boolean
    precioBoleto?: boolean
    subtotal?: boolean
    markup?: boolean
    total?: boolean
    fechaViaje?: boolean
    fechaRetorno?: boolean
    status?: boolean
    notas?: boolean
    tokenAprobacion?: boolean
    fechaCreacion?: boolean
    fechaEnvio?: boolean
    fechaAprobacion?: boolean
    fechaVencimiento?: boolean
  }

  export type CotizacionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "codigo" | "agenciaId" | "creadoPorId" | "paqueteId" | "clienteId" | "paqueteNombre" | "paqueteDuracion" | "paqueteDestino" | "paqueteIncluye" | "incluyeBoleto" | "cantSGL" | "cantDBL" | "cantTPL" | "cantQUAD" | "cantCHD" | "precioSGL" | "precioDBL" | "precioTPL" | "precioQUAD" | "precioCHD" | "precioBoleto" | "subtotal" | "markup" | "total" | "fechaViaje" | "fechaRetorno" | "status" | "notas" | "tokenAprobacion" | "fechaCreacion" | "fechaEnvio" | "fechaAprobacion" | "fechaVencimiento", ExtArgs["result"]["cotizacion"]>
  export type CotizacionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    agencia?: boolean | AgenciaDefaultArgs<ExtArgs>
    creadoPor?: boolean | UsuarioAgenciaDefaultArgs<ExtArgs>
    paquete?: boolean | PaqueteRefDefaultArgs<ExtArgs>
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    historial?: boolean | Cotizacion$historialArgs<ExtArgs>
    _count?: boolean | CotizacionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CotizacionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    agencia?: boolean | AgenciaDefaultArgs<ExtArgs>
    creadoPor?: boolean | UsuarioAgenciaDefaultArgs<ExtArgs>
    paquete?: boolean | PaqueteRefDefaultArgs<ExtArgs>
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
  }
  export type CotizacionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    agencia?: boolean | AgenciaDefaultArgs<ExtArgs>
    creadoPor?: boolean | UsuarioAgenciaDefaultArgs<ExtArgs>
    paquete?: boolean | PaqueteRefDefaultArgs<ExtArgs>
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
  }

  export type $CotizacionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Cotizacion"
    objects: {
      agencia: Prisma.$AgenciaPayload<ExtArgs>
      creadoPor: Prisma.$UsuarioAgenciaPayload<ExtArgs>
      paquete: Prisma.$PaqueteRefPayload<ExtArgs>
      cliente: Prisma.$ClientePayload<ExtArgs>
      historial: Prisma.$HistorialCotizacionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      /**
       * Código legible: COT-YYYYMMDD-NNN (generado en la Server Action)
       */
      codigo: string
      agenciaId: string
      creadoPorId: string
      paqueteId: number
      clienteId: string
      paqueteNombre: string
      paqueteDuracion: string
      paqueteDestino: string
      paqueteIncluye: string[]
      incluyeBoleto: boolean
      cantSGL: number
      cantDBL: number
      cantTPL: number
      cantQUAD: number
      cantCHD: number
      precioSGL: number | null
      precioDBL: number | null
      precioTPL: number | null
      precioQUAD: number | null
      precioCHD: number | null
      precioBoleto: number | null
      subtotal: number
      markup: number
      total: number
      fechaViaje: Date | null
      fechaRetorno: Date | null
      status: $Enums.CotizacionStatus
      notas: string | null
      /**
       * Token UUID enviado al cliente por email para aprobar/rechazar
       */
      tokenAprobacion: string | null
      fechaCreacion: Date
      fechaEnvio: Date | null
      fechaAprobacion: Date | null
      fechaVencimiento: Date | null
    }, ExtArgs["result"]["cotizacion"]>
    composites: {}
  }

  type CotizacionGetPayload<S extends boolean | null | undefined | CotizacionDefaultArgs> = $Result.GetResult<Prisma.$CotizacionPayload, S>

  type CotizacionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CotizacionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CotizacionCountAggregateInputType | true
    }

  export interface CotizacionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Cotizacion'], meta: { name: 'Cotizacion' } }
    /**
     * Find zero or one Cotizacion that matches the filter.
     * @param {CotizacionFindUniqueArgs} args - Arguments to find a Cotizacion
     * @example
     * // Get one Cotizacion
     * const cotizacion = await prisma.cotizacion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CotizacionFindUniqueArgs>(args: SelectSubset<T, CotizacionFindUniqueArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Cotizacion that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CotizacionFindUniqueOrThrowArgs} args - Arguments to find a Cotizacion
     * @example
     * // Get one Cotizacion
     * const cotizacion = await prisma.cotizacion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CotizacionFindUniqueOrThrowArgs>(args: SelectSubset<T, CotizacionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Cotizacion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CotizacionFindFirstArgs} args - Arguments to find a Cotizacion
     * @example
     * // Get one Cotizacion
     * const cotizacion = await prisma.cotizacion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CotizacionFindFirstArgs>(args?: SelectSubset<T, CotizacionFindFirstArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Cotizacion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CotizacionFindFirstOrThrowArgs} args - Arguments to find a Cotizacion
     * @example
     * // Get one Cotizacion
     * const cotizacion = await prisma.cotizacion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CotizacionFindFirstOrThrowArgs>(args?: SelectSubset<T, CotizacionFindFirstOrThrowArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Cotizacions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CotizacionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Cotizacions
     * const cotizacions = await prisma.cotizacion.findMany()
     * 
     * // Get first 10 Cotizacions
     * const cotizacions = await prisma.cotizacion.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cotizacionWithIdOnly = await prisma.cotizacion.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CotizacionFindManyArgs>(args?: SelectSubset<T, CotizacionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Cotizacion.
     * @param {CotizacionCreateArgs} args - Arguments to create a Cotizacion.
     * @example
     * // Create one Cotizacion
     * const Cotizacion = await prisma.cotizacion.create({
     *   data: {
     *     // ... data to create a Cotizacion
     *   }
     * })
     * 
     */
    create<T extends CotizacionCreateArgs>(args: SelectSubset<T, CotizacionCreateArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Cotizacions.
     * @param {CotizacionCreateManyArgs} args - Arguments to create many Cotizacions.
     * @example
     * // Create many Cotizacions
     * const cotizacion = await prisma.cotizacion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CotizacionCreateManyArgs>(args?: SelectSubset<T, CotizacionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Cotizacions and returns the data saved in the database.
     * @param {CotizacionCreateManyAndReturnArgs} args - Arguments to create many Cotizacions.
     * @example
     * // Create many Cotizacions
     * const cotizacion = await prisma.cotizacion.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Cotizacions and only return the `id`
     * const cotizacionWithIdOnly = await prisma.cotizacion.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CotizacionCreateManyAndReturnArgs>(args?: SelectSubset<T, CotizacionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Cotizacion.
     * @param {CotizacionDeleteArgs} args - Arguments to delete one Cotizacion.
     * @example
     * // Delete one Cotizacion
     * const Cotizacion = await prisma.cotizacion.delete({
     *   where: {
     *     // ... filter to delete one Cotizacion
     *   }
     * })
     * 
     */
    delete<T extends CotizacionDeleteArgs>(args: SelectSubset<T, CotizacionDeleteArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Cotizacion.
     * @param {CotizacionUpdateArgs} args - Arguments to update one Cotizacion.
     * @example
     * // Update one Cotizacion
     * const cotizacion = await prisma.cotizacion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CotizacionUpdateArgs>(args: SelectSubset<T, CotizacionUpdateArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Cotizacions.
     * @param {CotizacionDeleteManyArgs} args - Arguments to filter Cotizacions to delete.
     * @example
     * // Delete a few Cotizacions
     * const { count } = await prisma.cotizacion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CotizacionDeleteManyArgs>(args?: SelectSubset<T, CotizacionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Cotizacions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CotizacionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Cotizacions
     * const cotizacion = await prisma.cotizacion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CotizacionUpdateManyArgs>(args: SelectSubset<T, CotizacionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Cotizacions and returns the data updated in the database.
     * @param {CotizacionUpdateManyAndReturnArgs} args - Arguments to update many Cotizacions.
     * @example
     * // Update many Cotizacions
     * const cotizacion = await prisma.cotizacion.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Cotizacions and only return the `id`
     * const cotizacionWithIdOnly = await prisma.cotizacion.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CotizacionUpdateManyAndReturnArgs>(args: SelectSubset<T, CotizacionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Cotizacion.
     * @param {CotizacionUpsertArgs} args - Arguments to update or create a Cotizacion.
     * @example
     * // Update or create a Cotizacion
     * const cotizacion = await prisma.cotizacion.upsert({
     *   create: {
     *     // ... data to create a Cotizacion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Cotizacion we want to update
     *   }
     * })
     */
    upsert<T extends CotizacionUpsertArgs>(args: SelectSubset<T, CotizacionUpsertArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Cotizacions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CotizacionCountArgs} args - Arguments to filter Cotizacions to count.
     * @example
     * // Count the number of Cotizacions
     * const count = await prisma.cotizacion.count({
     *   where: {
     *     // ... the filter for the Cotizacions we want to count
     *   }
     * })
    **/
    count<T extends CotizacionCountArgs>(
      args?: Subset<T, CotizacionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CotizacionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Cotizacion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CotizacionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CotizacionAggregateArgs>(args: Subset<T, CotizacionAggregateArgs>): Prisma.PrismaPromise<GetCotizacionAggregateType<T>>

    /**
     * Group by Cotizacion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CotizacionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CotizacionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CotizacionGroupByArgs['orderBy'] }
        : { orderBy?: CotizacionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CotizacionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCotizacionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Cotizacion model
   */
  readonly fields: CotizacionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Cotizacion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CotizacionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    agencia<T extends AgenciaDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AgenciaDefaultArgs<ExtArgs>>): Prisma__AgenciaClient<$Result.GetResult<Prisma.$AgenciaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    creadoPor<T extends UsuarioAgenciaDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UsuarioAgenciaDefaultArgs<ExtArgs>>): Prisma__UsuarioAgenciaClient<$Result.GetResult<Prisma.$UsuarioAgenciaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    paquete<T extends PaqueteRefDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PaqueteRefDefaultArgs<ExtArgs>>): Prisma__PaqueteRefClient<$Result.GetResult<Prisma.$PaqueteRefPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    cliente<T extends ClienteDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClienteDefaultArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    historial<T extends Cotizacion$historialArgs<ExtArgs> = {}>(args?: Subset<T, Cotizacion$historialArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HistorialCotizacionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Cotizacion model
   */
  interface CotizacionFieldRefs {
    readonly id: FieldRef<"Cotizacion", 'String'>
    readonly codigo: FieldRef<"Cotizacion", 'String'>
    readonly agenciaId: FieldRef<"Cotizacion", 'String'>
    readonly creadoPorId: FieldRef<"Cotizacion", 'String'>
    readonly paqueteId: FieldRef<"Cotizacion", 'Int'>
    readonly clienteId: FieldRef<"Cotizacion", 'String'>
    readonly paqueteNombre: FieldRef<"Cotizacion", 'String'>
    readonly paqueteDuracion: FieldRef<"Cotizacion", 'String'>
    readonly paqueteDestino: FieldRef<"Cotizacion", 'String'>
    readonly paqueteIncluye: FieldRef<"Cotizacion", 'String[]'>
    readonly incluyeBoleto: FieldRef<"Cotizacion", 'Boolean'>
    readonly cantSGL: FieldRef<"Cotizacion", 'Int'>
    readonly cantDBL: FieldRef<"Cotizacion", 'Int'>
    readonly cantTPL: FieldRef<"Cotizacion", 'Int'>
    readonly cantQUAD: FieldRef<"Cotizacion", 'Int'>
    readonly cantCHD: FieldRef<"Cotizacion", 'Int'>
    readonly precioSGL: FieldRef<"Cotizacion", 'Float'>
    readonly precioDBL: FieldRef<"Cotizacion", 'Float'>
    readonly precioTPL: FieldRef<"Cotizacion", 'Float'>
    readonly precioQUAD: FieldRef<"Cotizacion", 'Float'>
    readonly precioCHD: FieldRef<"Cotizacion", 'Float'>
    readonly precioBoleto: FieldRef<"Cotizacion", 'Float'>
    readonly subtotal: FieldRef<"Cotizacion", 'Float'>
    readonly markup: FieldRef<"Cotizacion", 'Float'>
    readonly total: FieldRef<"Cotizacion", 'Float'>
    readonly fechaViaje: FieldRef<"Cotizacion", 'DateTime'>
    readonly fechaRetorno: FieldRef<"Cotizacion", 'DateTime'>
    readonly status: FieldRef<"Cotizacion", 'CotizacionStatus'>
    readonly notas: FieldRef<"Cotizacion", 'String'>
    readonly tokenAprobacion: FieldRef<"Cotizacion", 'String'>
    readonly fechaCreacion: FieldRef<"Cotizacion", 'DateTime'>
    readonly fechaEnvio: FieldRef<"Cotizacion", 'DateTime'>
    readonly fechaAprobacion: FieldRef<"Cotizacion", 'DateTime'>
    readonly fechaVencimiento: FieldRef<"Cotizacion", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Cotizacion findUnique
   */
  export type CotizacionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cotizacion
     */
    omit?: CotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * Filter, which Cotizacion to fetch.
     */
    where: CotizacionWhereUniqueInput
  }

  /**
   * Cotizacion findUniqueOrThrow
   */
  export type CotizacionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cotizacion
     */
    omit?: CotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * Filter, which Cotizacion to fetch.
     */
    where: CotizacionWhereUniqueInput
  }

  /**
   * Cotizacion findFirst
   */
  export type CotizacionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cotizacion
     */
    omit?: CotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * Filter, which Cotizacion to fetch.
     */
    where?: CotizacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cotizacions to fetch.
     */
    orderBy?: CotizacionOrderByWithRelationInput | CotizacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Cotizacions.
     */
    cursor?: CotizacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cotizacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cotizacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cotizacions.
     */
    distinct?: CotizacionScalarFieldEnum | CotizacionScalarFieldEnum[]
  }

  /**
   * Cotizacion findFirstOrThrow
   */
  export type CotizacionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cotizacion
     */
    omit?: CotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * Filter, which Cotizacion to fetch.
     */
    where?: CotizacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cotizacions to fetch.
     */
    orderBy?: CotizacionOrderByWithRelationInput | CotizacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Cotizacions.
     */
    cursor?: CotizacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cotizacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cotizacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cotizacions.
     */
    distinct?: CotizacionScalarFieldEnum | CotizacionScalarFieldEnum[]
  }

  /**
   * Cotizacion findMany
   */
  export type CotizacionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cotizacion
     */
    omit?: CotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * Filter, which Cotizacions to fetch.
     */
    where?: CotizacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cotizacions to fetch.
     */
    orderBy?: CotizacionOrderByWithRelationInput | CotizacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Cotizacions.
     */
    cursor?: CotizacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cotizacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cotizacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cotizacions.
     */
    distinct?: CotizacionScalarFieldEnum | CotizacionScalarFieldEnum[]
  }

  /**
   * Cotizacion create
   */
  export type CotizacionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cotizacion
     */
    omit?: CotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * The data needed to create a Cotizacion.
     */
    data: XOR<CotizacionCreateInput, CotizacionUncheckedCreateInput>
  }

  /**
   * Cotizacion createMany
   */
  export type CotizacionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Cotizacions.
     */
    data: CotizacionCreateManyInput | CotizacionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Cotizacion createManyAndReturn
   */
  export type CotizacionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Cotizacion
     */
    omit?: CotizacionOmit<ExtArgs> | null
    /**
     * The data used to create many Cotizacions.
     */
    data: CotizacionCreateManyInput | CotizacionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Cotizacion update
   */
  export type CotizacionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cotizacion
     */
    omit?: CotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * The data needed to update a Cotizacion.
     */
    data: XOR<CotizacionUpdateInput, CotizacionUncheckedUpdateInput>
    /**
     * Choose, which Cotizacion to update.
     */
    where: CotizacionWhereUniqueInput
  }

  /**
   * Cotizacion updateMany
   */
  export type CotizacionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Cotizacions.
     */
    data: XOR<CotizacionUpdateManyMutationInput, CotizacionUncheckedUpdateManyInput>
    /**
     * Filter which Cotizacions to update
     */
    where?: CotizacionWhereInput
    /**
     * Limit how many Cotizacions to update.
     */
    limit?: number
  }

  /**
   * Cotizacion updateManyAndReturn
   */
  export type CotizacionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Cotizacion
     */
    omit?: CotizacionOmit<ExtArgs> | null
    /**
     * The data used to update Cotizacions.
     */
    data: XOR<CotizacionUpdateManyMutationInput, CotizacionUncheckedUpdateManyInput>
    /**
     * Filter which Cotizacions to update
     */
    where?: CotizacionWhereInput
    /**
     * Limit how many Cotizacions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Cotizacion upsert
   */
  export type CotizacionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cotizacion
     */
    omit?: CotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * The filter to search for the Cotizacion to update in case it exists.
     */
    where: CotizacionWhereUniqueInput
    /**
     * In case the Cotizacion found by the `where` argument doesn't exist, create a new Cotizacion with this data.
     */
    create: XOR<CotizacionCreateInput, CotizacionUncheckedCreateInput>
    /**
     * In case the Cotizacion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CotizacionUpdateInput, CotizacionUncheckedUpdateInput>
  }

  /**
   * Cotizacion delete
   */
  export type CotizacionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cotizacion
     */
    omit?: CotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * Filter which Cotizacion to delete.
     */
    where: CotizacionWhereUniqueInput
  }

  /**
   * Cotizacion deleteMany
   */
  export type CotizacionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Cotizacions to delete
     */
    where?: CotizacionWhereInput
    /**
     * Limit how many Cotizacions to delete.
     */
    limit?: number
  }

  /**
   * Cotizacion.historial
   */
  export type Cotizacion$historialArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorialCotizacion
     */
    select?: HistorialCotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HistorialCotizacion
     */
    omit?: HistorialCotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistorialCotizacionInclude<ExtArgs> | null
    where?: HistorialCotizacionWhereInput
    orderBy?: HistorialCotizacionOrderByWithRelationInput | HistorialCotizacionOrderByWithRelationInput[]
    cursor?: HistorialCotizacionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: HistorialCotizacionScalarFieldEnum | HistorialCotizacionScalarFieldEnum[]
  }

  /**
   * Cotizacion without action
   */
  export type CotizacionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cotizacion
     */
    omit?: CotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
  }


  /**
   * Model HistorialCotizacion
   */

  export type AggregateHistorialCotizacion = {
    _count: HistorialCotizacionCountAggregateOutputType | null
    _min: HistorialCotizacionMinAggregateOutputType | null
    _max: HistorialCotizacionMaxAggregateOutputType | null
  }

  export type HistorialCotizacionMinAggregateOutputType = {
    id: string | null
    cotizacionId: string | null
    cambiadoPorId: string | null
    statusAnterior: $Enums.CotizacionStatus | null
    statusNuevo: $Enums.CotizacionStatus | null
    nota: string | null
    fecha: Date | null
  }

  export type HistorialCotizacionMaxAggregateOutputType = {
    id: string | null
    cotizacionId: string | null
    cambiadoPorId: string | null
    statusAnterior: $Enums.CotizacionStatus | null
    statusNuevo: $Enums.CotizacionStatus | null
    nota: string | null
    fecha: Date | null
  }

  export type HistorialCotizacionCountAggregateOutputType = {
    id: number
    cotizacionId: number
    cambiadoPorId: number
    statusAnterior: number
    statusNuevo: number
    nota: number
    fecha: number
    _all: number
  }


  export type HistorialCotizacionMinAggregateInputType = {
    id?: true
    cotizacionId?: true
    cambiadoPorId?: true
    statusAnterior?: true
    statusNuevo?: true
    nota?: true
    fecha?: true
  }

  export type HistorialCotizacionMaxAggregateInputType = {
    id?: true
    cotizacionId?: true
    cambiadoPorId?: true
    statusAnterior?: true
    statusNuevo?: true
    nota?: true
    fecha?: true
  }

  export type HistorialCotizacionCountAggregateInputType = {
    id?: true
    cotizacionId?: true
    cambiadoPorId?: true
    statusAnterior?: true
    statusNuevo?: true
    nota?: true
    fecha?: true
    _all?: true
  }

  export type HistorialCotizacionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which HistorialCotizacion to aggregate.
     */
    where?: HistorialCotizacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HistorialCotizacions to fetch.
     */
    orderBy?: HistorialCotizacionOrderByWithRelationInput | HistorialCotizacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: HistorialCotizacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HistorialCotizacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HistorialCotizacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned HistorialCotizacions
    **/
    _count?: true | HistorialCotizacionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: HistorialCotizacionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: HistorialCotizacionMaxAggregateInputType
  }

  export type GetHistorialCotizacionAggregateType<T extends HistorialCotizacionAggregateArgs> = {
        [P in keyof T & keyof AggregateHistorialCotizacion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateHistorialCotizacion[P]>
      : GetScalarType<T[P], AggregateHistorialCotizacion[P]>
  }




  export type HistorialCotizacionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HistorialCotizacionWhereInput
    orderBy?: HistorialCotizacionOrderByWithAggregationInput | HistorialCotizacionOrderByWithAggregationInput[]
    by: HistorialCotizacionScalarFieldEnum[] | HistorialCotizacionScalarFieldEnum
    having?: HistorialCotizacionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: HistorialCotizacionCountAggregateInputType | true
    _min?: HistorialCotizacionMinAggregateInputType
    _max?: HistorialCotizacionMaxAggregateInputType
  }

  export type HistorialCotizacionGroupByOutputType = {
    id: string
    cotizacionId: string
    cambiadoPorId: string
    statusAnterior: $Enums.CotizacionStatus | null
    statusNuevo: $Enums.CotizacionStatus
    nota: string | null
    fecha: Date
    _count: HistorialCotizacionCountAggregateOutputType | null
    _min: HistorialCotizacionMinAggregateOutputType | null
    _max: HistorialCotizacionMaxAggregateOutputType | null
  }

  type GetHistorialCotizacionGroupByPayload<T extends HistorialCotizacionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<HistorialCotizacionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof HistorialCotizacionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], HistorialCotizacionGroupByOutputType[P]>
            : GetScalarType<T[P], HistorialCotizacionGroupByOutputType[P]>
        }
      >
    >


  export type HistorialCotizacionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cotizacionId?: boolean
    cambiadoPorId?: boolean
    statusAnterior?: boolean
    statusNuevo?: boolean
    nota?: boolean
    fecha?: boolean
    cotizacion?: boolean | CotizacionDefaultArgs<ExtArgs>
    cambiadoPor?: boolean | UsuarioAgenciaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["historialCotizacion"]>

  export type HistorialCotizacionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cotizacionId?: boolean
    cambiadoPorId?: boolean
    statusAnterior?: boolean
    statusNuevo?: boolean
    nota?: boolean
    fecha?: boolean
    cotizacion?: boolean | CotizacionDefaultArgs<ExtArgs>
    cambiadoPor?: boolean | UsuarioAgenciaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["historialCotizacion"]>

  export type HistorialCotizacionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cotizacionId?: boolean
    cambiadoPorId?: boolean
    statusAnterior?: boolean
    statusNuevo?: boolean
    nota?: boolean
    fecha?: boolean
    cotizacion?: boolean | CotizacionDefaultArgs<ExtArgs>
    cambiadoPor?: boolean | UsuarioAgenciaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["historialCotizacion"]>

  export type HistorialCotizacionSelectScalar = {
    id?: boolean
    cotizacionId?: boolean
    cambiadoPorId?: boolean
    statusAnterior?: boolean
    statusNuevo?: boolean
    nota?: boolean
    fecha?: boolean
  }

  export type HistorialCotizacionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "cotizacionId" | "cambiadoPorId" | "statusAnterior" | "statusNuevo" | "nota" | "fecha", ExtArgs["result"]["historialCotizacion"]>
  export type HistorialCotizacionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cotizacion?: boolean | CotizacionDefaultArgs<ExtArgs>
    cambiadoPor?: boolean | UsuarioAgenciaDefaultArgs<ExtArgs>
  }
  export type HistorialCotizacionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cotizacion?: boolean | CotizacionDefaultArgs<ExtArgs>
    cambiadoPor?: boolean | UsuarioAgenciaDefaultArgs<ExtArgs>
  }
  export type HistorialCotizacionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cotizacion?: boolean | CotizacionDefaultArgs<ExtArgs>
    cambiadoPor?: boolean | UsuarioAgenciaDefaultArgs<ExtArgs>
  }

  export type $HistorialCotizacionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "HistorialCotizacion"
    objects: {
      cotizacion: Prisma.$CotizacionPayload<ExtArgs>
      cambiadoPor: Prisma.$UsuarioAgenciaPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      cotizacionId: string
      cambiadoPorId: string
      statusAnterior: $Enums.CotizacionStatus | null
      statusNuevo: $Enums.CotizacionStatus
      nota: string | null
      fecha: Date
    }, ExtArgs["result"]["historialCotizacion"]>
    composites: {}
  }

  type HistorialCotizacionGetPayload<S extends boolean | null | undefined | HistorialCotizacionDefaultArgs> = $Result.GetResult<Prisma.$HistorialCotizacionPayload, S>

  type HistorialCotizacionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<HistorialCotizacionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: HistorialCotizacionCountAggregateInputType | true
    }

  export interface HistorialCotizacionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['HistorialCotizacion'], meta: { name: 'HistorialCotizacion' } }
    /**
     * Find zero or one HistorialCotizacion that matches the filter.
     * @param {HistorialCotizacionFindUniqueArgs} args - Arguments to find a HistorialCotizacion
     * @example
     * // Get one HistorialCotizacion
     * const historialCotizacion = await prisma.historialCotizacion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends HistorialCotizacionFindUniqueArgs>(args: SelectSubset<T, HistorialCotizacionFindUniqueArgs<ExtArgs>>): Prisma__HistorialCotizacionClient<$Result.GetResult<Prisma.$HistorialCotizacionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one HistorialCotizacion that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {HistorialCotizacionFindUniqueOrThrowArgs} args - Arguments to find a HistorialCotizacion
     * @example
     * // Get one HistorialCotizacion
     * const historialCotizacion = await prisma.historialCotizacion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends HistorialCotizacionFindUniqueOrThrowArgs>(args: SelectSubset<T, HistorialCotizacionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__HistorialCotizacionClient<$Result.GetResult<Prisma.$HistorialCotizacionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first HistorialCotizacion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HistorialCotizacionFindFirstArgs} args - Arguments to find a HistorialCotizacion
     * @example
     * // Get one HistorialCotizacion
     * const historialCotizacion = await prisma.historialCotizacion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends HistorialCotizacionFindFirstArgs>(args?: SelectSubset<T, HistorialCotizacionFindFirstArgs<ExtArgs>>): Prisma__HistorialCotizacionClient<$Result.GetResult<Prisma.$HistorialCotizacionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first HistorialCotizacion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HistorialCotizacionFindFirstOrThrowArgs} args - Arguments to find a HistorialCotizacion
     * @example
     * // Get one HistorialCotizacion
     * const historialCotizacion = await prisma.historialCotizacion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends HistorialCotizacionFindFirstOrThrowArgs>(args?: SelectSubset<T, HistorialCotizacionFindFirstOrThrowArgs<ExtArgs>>): Prisma__HistorialCotizacionClient<$Result.GetResult<Prisma.$HistorialCotizacionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more HistorialCotizacions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HistorialCotizacionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all HistorialCotizacions
     * const historialCotizacions = await prisma.historialCotizacion.findMany()
     * 
     * // Get first 10 HistorialCotizacions
     * const historialCotizacions = await prisma.historialCotizacion.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const historialCotizacionWithIdOnly = await prisma.historialCotizacion.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends HistorialCotizacionFindManyArgs>(args?: SelectSubset<T, HistorialCotizacionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HistorialCotizacionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a HistorialCotizacion.
     * @param {HistorialCotizacionCreateArgs} args - Arguments to create a HistorialCotizacion.
     * @example
     * // Create one HistorialCotizacion
     * const HistorialCotizacion = await prisma.historialCotizacion.create({
     *   data: {
     *     // ... data to create a HistorialCotizacion
     *   }
     * })
     * 
     */
    create<T extends HistorialCotizacionCreateArgs>(args: SelectSubset<T, HistorialCotizacionCreateArgs<ExtArgs>>): Prisma__HistorialCotizacionClient<$Result.GetResult<Prisma.$HistorialCotizacionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many HistorialCotizacions.
     * @param {HistorialCotizacionCreateManyArgs} args - Arguments to create many HistorialCotizacions.
     * @example
     * // Create many HistorialCotizacions
     * const historialCotizacion = await prisma.historialCotizacion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends HistorialCotizacionCreateManyArgs>(args?: SelectSubset<T, HistorialCotizacionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many HistorialCotizacions and returns the data saved in the database.
     * @param {HistorialCotizacionCreateManyAndReturnArgs} args - Arguments to create many HistorialCotizacions.
     * @example
     * // Create many HistorialCotizacions
     * const historialCotizacion = await prisma.historialCotizacion.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many HistorialCotizacions and only return the `id`
     * const historialCotizacionWithIdOnly = await prisma.historialCotizacion.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends HistorialCotizacionCreateManyAndReturnArgs>(args?: SelectSubset<T, HistorialCotizacionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HistorialCotizacionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a HistorialCotizacion.
     * @param {HistorialCotizacionDeleteArgs} args - Arguments to delete one HistorialCotizacion.
     * @example
     * // Delete one HistorialCotizacion
     * const HistorialCotizacion = await prisma.historialCotizacion.delete({
     *   where: {
     *     // ... filter to delete one HistorialCotizacion
     *   }
     * })
     * 
     */
    delete<T extends HistorialCotizacionDeleteArgs>(args: SelectSubset<T, HistorialCotizacionDeleteArgs<ExtArgs>>): Prisma__HistorialCotizacionClient<$Result.GetResult<Prisma.$HistorialCotizacionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one HistorialCotizacion.
     * @param {HistorialCotizacionUpdateArgs} args - Arguments to update one HistorialCotizacion.
     * @example
     * // Update one HistorialCotizacion
     * const historialCotizacion = await prisma.historialCotizacion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends HistorialCotizacionUpdateArgs>(args: SelectSubset<T, HistorialCotizacionUpdateArgs<ExtArgs>>): Prisma__HistorialCotizacionClient<$Result.GetResult<Prisma.$HistorialCotizacionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more HistorialCotizacions.
     * @param {HistorialCotizacionDeleteManyArgs} args - Arguments to filter HistorialCotizacions to delete.
     * @example
     * // Delete a few HistorialCotizacions
     * const { count } = await prisma.historialCotizacion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends HistorialCotizacionDeleteManyArgs>(args?: SelectSubset<T, HistorialCotizacionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more HistorialCotizacions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HistorialCotizacionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many HistorialCotizacions
     * const historialCotizacion = await prisma.historialCotizacion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends HistorialCotizacionUpdateManyArgs>(args: SelectSubset<T, HistorialCotizacionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more HistorialCotizacions and returns the data updated in the database.
     * @param {HistorialCotizacionUpdateManyAndReturnArgs} args - Arguments to update many HistorialCotizacions.
     * @example
     * // Update many HistorialCotizacions
     * const historialCotizacion = await prisma.historialCotizacion.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more HistorialCotizacions and only return the `id`
     * const historialCotizacionWithIdOnly = await prisma.historialCotizacion.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends HistorialCotizacionUpdateManyAndReturnArgs>(args: SelectSubset<T, HistorialCotizacionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HistorialCotizacionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one HistorialCotizacion.
     * @param {HistorialCotizacionUpsertArgs} args - Arguments to update or create a HistorialCotizacion.
     * @example
     * // Update or create a HistorialCotizacion
     * const historialCotizacion = await prisma.historialCotizacion.upsert({
     *   create: {
     *     // ... data to create a HistorialCotizacion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the HistorialCotizacion we want to update
     *   }
     * })
     */
    upsert<T extends HistorialCotizacionUpsertArgs>(args: SelectSubset<T, HistorialCotizacionUpsertArgs<ExtArgs>>): Prisma__HistorialCotizacionClient<$Result.GetResult<Prisma.$HistorialCotizacionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of HistorialCotizacions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HistorialCotizacionCountArgs} args - Arguments to filter HistorialCotizacions to count.
     * @example
     * // Count the number of HistorialCotizacions
     * const count = await prisma.historialCotizacion.count({
     *   where: {
     *     // ... the filter for the HistorialCotizacions we want to count
     *   }
     * })
    **/
    count<T extends HistorialCotizacionCountArgs>(
      args?: Subset<T, HistorialCotizacionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], HistorialCotizacionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a HistorialCotizacion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HistorialCotizacionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends HistorialCotizacionAggregateArgs>(args: Subset<T, HistorialCotizacionAggregateArgs>): Prisma.PrismaPromise<GetHistorialCotizacionAggregateType<T>>

    /**
     * Group by HistorialCotizacion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HistorialCotizacionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends HistorialCotizacionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: HistorialCotizacionGroupByArgs['orderBy'] }
        : { orderBy?: HistorialCotizacionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, HistorialCotizacionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetHistorialCotizacionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the HistorialCotizacion model
   */
  readonly fields: HistorialCotizacionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for HistorialCotizacion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__HistorialCotizacionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    cotizacion<T extends CotizacionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CotizacionDefaultArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    cambiadoPor<T extends UsuarioAgenciaDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UsuarioAgenciaDefaultArgs<ExtArgs>>): Prisma__UsuarioAgenciaClient<$Result.GetResult<Prisma.$UsuarioAgenciaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the HistorialCotizacion model
   */
  interface HistorialCotizacionFieldRefs {
    readonly id: FieldRef<"HistorialCotizacion", 'String'>
    readonly cotizacionId: FieldRef<"HistorialCotizacion", 'String'>
    readonly cambiadoPorId: FieldRef<"HistorialCotizacion", 'String'>
    readonly statusAnterior: FieldRef<"HistorialCotizacion", 'CotizacionStatus'>
    readonly statusNuevo: FieldRef<"HistorialCotizacion", 'CotizacionStatus'>
    readonly nota: FieldRef<"HistorialCotizacion", 'String'>
    readonly fecha: FieldRef<"HistorialCotizacion", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * HistorialCotizacion findUnique
   */
  export type HistorialCotizacionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorialCotizacion
     */
    select?: HistorialCotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HistorialCotizacion
     */
    omit?: HistorialCotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistorialCotizacionInclude<ExtArgs> | null
    /**
     * Filter, which HistorialCotizacion to fetch.
     */
    where: HistorialCotizacionWhereUniqueInput
  }

  /**
   * HistorialCotizacion findUniqueOrThrow
   */
  export type HistorialCotizacionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorialCotizacion
     */
    select?: HistorialCotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HistorialCotizacion
     */
    omit?: HistorialCotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistorialCotizacionInclude<ExtArgs> | null
    /**
     * Filter, which HistorialCotizacion to fetch.
     */
    where: HistorialCotizacionWhereUniqueInput
  }

  /**
   * HistorialCotizacion findFirst
   */
  export type HistorialCotizacionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorialCotizacion
     */
    select?: HistorialCotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HistorialCotizacion
     */
    omit?: HistorialCotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistorialCotizacionInclude<ExtArgs> | null
    /**
     * Filter, which HistorialCotizacion to fetch.
     */
    where?: HistorialCotizacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HistorialCotizacions to fetch.
     */
    orderBy?: HistorialCotizacionOrderByWithRelationInput | HistorialCotizacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for HistorialCotizacions.
     */
    cursor?: HistorialCotizacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HistorialCotizacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HistorialCotizacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of HistorialCotizacions.
     */
    distinct?: HistorialCotizacionScalarFieldEnum | HistorialCotizacionScalarFieldEnum[]
  }

  /**
   * HistorialCotizacion findFirstOrThrow
   */
  export type HistorialCotizacionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorialCotizacion
     */
    select?: HistorialCotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HistorialCotizacion
     */
    omit?: HistorialCotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistorialCotizacionInclude<ExtArgs> | null
    /**
     * Filter, which HistorialCotizacion to fetch.
     */
    where?: HistorialCotizacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HistorialCotizacions to fetch.
     */
    orderBy?: HistorialCotizacionOrderByWithRelationInput | HistorialCotizacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for HistorialCotizacions.
     */
    cursor?: HistorialCotizacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HistorialCotizacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HistorialCotizacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of HistorialCotizacions.
     */
    distinct?: HistorialCotizacionScalarFieldEnum | HistorialCotizacionScalarFieldEnum[]
  }

  /**
   * HistorialCotizacion findMany
   */
  export type HistorialCotizacionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorialCotizacion
     */
    select?: HistorialCotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HistorialCotizacion
     */
    omit?: HistorialCotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistorialCotizacionInclude<ExtArgs> | null
    /**
     * Filter, which HistorialCotizacions to fetch.
     */
    where?: HistorialCotizacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of HistorialCotizacions to fetch.
     */
    orderBy?: HistorialCotizacionOrderByWithRelationInput | HistorialCotizacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing HistorialCotizacions.
     */
    cursor?: HistorialCotizacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` HistorialCotizacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` HistorialCotizacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of HistorialCotizacions.
     */
    distinct?: HistorialCotizacionScalarFieldEnum | HistorialCotizacionScalarFieldEnum[]
  }

  /**
   * HistorialCotizacion create
   */
  export type HistorialCotizacionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorialCotizacion
     */
    select?: HistorialCotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HistorialCotizacion
     */
    omit?: HistorialCotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistorialCotizacionInclude<ExtArgs> | null
    /**
     * The data needed to create a HistorialCotizacion.
     */
    data: XOR<HistorialCotizacionCreateInput, HistorialCotizacionUncheckedCreateInput>
  }

  /**
   * HistorialCotizacion createMany
   */
  export type HistorialCotizacionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many HistorialCotizacions.
     */
    data: HistorialCotizacionCreateManyInput | HistorialCotizacionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * HistorialCotizacion createManyAndReturn
   */
  export type HistorialCotizacionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorialCotizacion
     */
    select?: HistorialCotizacionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the HistorialCotizacion
     */
    omit?: HistorialCotizacionOmit<ExtArgs> | null
    /**
     * The data used to create many HistorialCotizacions.
     */
    data: HistorialCotizacionCreateManyInput | HistorialCotizacionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistorialCotizacionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * HistorialCotizacion update
   */
  export type HistorialCotizacionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorialCotizacion
     */
    select?: HistorialCotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HistorialCotizacion
     */
    omit?: HistorialCotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistorialCotizacionInclude<ExtArgs> | null
    /**
     * The data needed to update a HistorialCotizacion.
     */
    data: XOR<HistorialCotizacionUpdateInput, HistorialCotizacionUncheckedUpdateInput>
    /**
     * Choose, which HistorialCotizacion to update.
     */
    where: HistorialCotizacionWhereUniqueInput
  }

  /**
   * HistorialCotizacion updateMany
   */
  export type HistorialCotizacionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update HistorialCotizacions.
     */
    data: XOR<HistorialCotizacionUpdateManyMutationInput, HistorialCotizacionUncheckedUpdateManyInput>
    /**
     * Filter which HistorialCotizacions to update
     */
    where?: HistorialCotizacionWhereInput
    /**
     * Limit how many HistorialCotizacions to update.
     */
    limit?: number
  }

  /**
   * HistorialCotizacion updateManyAndReturn
   */
  export type HistorialCotizacionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorialCotizacion
     */
    select?: HistorialCotizacionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the HistorialCotizacion
     */
    omit?: HistorialCotizacionOmit<ExtArgs> | null
    /**
     * The data used to update HistorialCotizacions.
     */
    data: XOR<HistorialCotizacionUpdateManyMutationInput, HistorialCotizacionUncheckedUpdateManyInput>
    /**
     * Filter which HistorialCotizacions to update
     */
    where?: HistorialCotizacionWhereInput
    /**
     * Limit how many HistorialCotizacions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistorialCotizacionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * HistorialCotizacion upsert
   */
  export type HistorialCotizacionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorialCotizacion
     */
    select?: HistorialCotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HistorialCotizacion
     */
    omit?: HistorialCotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistorialCotizacionInclude<ExtArgs> | null
    /**
     * The filter to search for the HistorialCotizacion to update in case it exists.
     */
    where: HistorialCotizacionWhereUniqueInput
    /**
     * In case the HistorialCotizacion found by the `where` argument doesn't exist, create a new HistorialCotizacion with this data.
     */
    create: XOR<HistorialCotizacionCreateInput, HistorialCotizacionUncheckedCreateInput>
    /**
     * In case the HistorialCotizacion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<HistorialCotizacionUpdateInput, HistorialCotizacionUncheckedUpdateInput>
  }

  /**
   * HistorialCotizacion delete
   */
  export type HistorialCotizacionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorialCotizacion
     */
    select?: HistorialCotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HistorialCotizacion
     */
    omit?: HistorialCotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistorialCotizacionInclude<ExtArgs> | null
    /**
     * Filter which HistorialCotizacion to delete.
     */
    where: HistorialCotizacionWhereUniqueInput
  }

  /**
   * HistorialCotizacion deleteMany
   */
  export type HistorialCotizacionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which HistorialCotizacions to delete
     */
    where?: HistorialCotizacionWhereInput
    /**
     * Limit how many HistorialCotizacions to delete.
     */
    limit?: number
  }

  /**
   * HistorialCotizacion without action
   */
  export type HistorialCotizacionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the HistorialCotizacion
     */
    select?: HistorialCotizacionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the HistorialCotizacion
     */
    omit?: HistorialCotizacionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HistorialCotizacionInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const AgenciaScalarFieldEnum: {
    id: 'id',
    nombre: 'nombre',
    correo: 'correo',
    telefono: 'telefono'
  };

  export type AgenciaScalarFieldEnum = (typeof AgenciaScalarFieldEnum)[keyof typeof AgenciaScalarFieldEnum]


  export const UsuarioAgenciaScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    password: 'password',
    role: 'role',
    agenciaId: 'agenciaId'
  };

  export type UsuarioAgenciaScalarFieldEnum = (typeof UsuarioAgenciaScalarFieldEnum)[keyof typeof UsuarioAgenciaScalarFieldEnum]


  export const DestinoRefScalarFieldEnum: {
    id: 'id',
    pais: 'pais',
    ciudad: 'ciudad',
    tagline: 'tagline',
    descripcion: 'descripcion',
    imagen: 'imagen',
    color: 'color'
  };

  export type DestinoRefScalarFieldEnum = (typeof DestinoRefScalarFieldEnum)[keyof typeof DestinoRefScalarFieldEnum]


  export const PaqueteRefScalarFieldEnum: {
    id: 'id',
    nombre: 'nombre',
    descripcion: 'descripcion',
    imagen: 'imagen',
    categoria: 'categoria',
    diasEstancia: 'diasEstancia',
    nochesBase: 'nochesBase',
    incluyeBoleto: 'incluyeBoleto',
    precioBoleto: 'precioBoleto',
    precioSGL: 'precioSGL',
    precioDBL: 'precioDBL',
    precioTPL: 'precioTPL',
    precioQUAD: 'precioQUAD',
    precioPorPersona: 'precioPorPersona',
    destinoId: 'destinoId'
  };

  export type PaqueteRefScalarFieldEnum = (typeof PaqueteRefScalarFieldEnum)[keyof typeof PaqueteRefScalarFieldEnum]


  export const ClienteScalarFieldEnum: {
    id: 'id',
    agenciaId: 'agenciaId',
    nombre: 'nombre',
    email: 'email',
    telefono: 'telefono',
    documento: 'documento',
    direccion: 'direccion',
    fechaAlta: 'fechaAlta'
  };

  export type ClienteScalarFieldEnum = (typeof ClienteScalarFieldEnum)[keyof typeof ClienteScalarFieldEnum]


  export const CotizacionScalarFieldEnum: {
    id: 'id',
    codigo: 'codigo',
    agenciaId: 'agenciaId',
    creadoPorId: 'creadoPorId',
    paqueteId: 'paqueteId',
    clienteId: 'clienteId',
    paqueteNombre: 'paqueteNombre',
    paqueteDuracion: 'paqueteDuracion',
    paqueteDestino: 'paqueteDestino',
    paqueteIncluye: 'paqueteIncluye',
    incluyeBoleto: 'incluyeBoleto',
    cantSGL: 'cantSGL',
    cantDBL: 'cantDBL',
    cantTPL: 'cantTPL',
    cantQUAD: 'cantQUAD',
    cantCHD: 'cantCHD',
    precioSGL: 'precioSGL',
    precioDBL: 'precioDBL',
    precioTPL: 'precioTPL',
    precioQUAD: 'precioQUAD',
    precioCHD: 'precioCHD',
    precioBoleto: 'precioBoleto',
    subtotal: 'subtotal',
    markup: 'markup',
    total: 'total',
    fechaViaje: 'fechaViaje',
    fechaRetorno: 'fechaRetorno',
    status: 'status',
    notas: 'notas',
    tokenAprobacion: 'tokenAprobacion',
    fechaCreacion: 'fechaCreacion',
    fechaEnvio: 'fechaEnvio',
    fechaAprobacion: 'fechaAprobacion',
    fechaVencimiento: 'fechaVencimiento'
  };

  export type CotizacionScalarFieldEnum = (typeof CotizacionScalarFieldEnum)[keyof typeof CotizacionScalarFieldEnum]


  export const HistorialCotizacionScalarFieldEnum: {
    id: 'id',
    cotizacionId: 'cotizacionId',
    cambiadoPorId: 'cambiadoPorId',
    statusAnterior: 'statusAnterior',
    statusNuevo: 'statusNuevo',
    nota: 'nota',
    fecha: 'fecha'
  };

  export type HistorialCotizacionScalarFieldEnum = (typeof HistorialCotizacionScalarFieldEnum)[keyof typeof HistorialCotizacionScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'CotizacionStatus'
   */
  export type EnumCotizacionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CotizacionStatus'>
    


  /**
   * Reference to a field of type 'CotizacionStatus[]'
   */
  export type ListEnumCotizacionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CotizacionStatus[]'>
    
  /**
   * Deep Input Types
   */


  export type AgenciaWhereInput = {
    AND?: AgenciaWhereInput | AgenciaWhereInput[]
    OR?: AgenciaWhereInput[]
    NOT?: AgenciaWhereInput | AgenciaWhereInput[]
    id?: StringFilter<"Agencia"> | string
    nombre?: StringFilter<"Agencia"> | string
    correo?: StringNullableFilter<"Agencia"> | string | null
    telefono?: StringNullableFilter<"Agencia"> | string | null
    usuarios?: UsuarioAgenciaListRelationFilter
    clientes?: ClienteListRelationFilter
    cotizaciones?: CotizacionListRelationFilter
  }

  export type AgenciaOrderByWithRelationInput = {
    id?: SortOrder
    nombre?: SortOrder
    correo?: SortOrderInput | SortOrder
    telefono?: SortOrderInput | SortOrder
    usuarios?: UsuarioAgenciaOrderByRelationAggregateInput
    clientes?: ClienteOrderByRelationAggregateInput
    cotizaciones?: CotizacionOrderByRelationAggregateInput
  }

  export type AgenciaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AgenciaWhereInput | AgenciaWhereInput[]
    OR?: AgenciaWhereInput[]
    NOT?: AgenciaWhereInput | AgenciaWhereInput[]
    nombre?: StringFilter<"Agencia"> | string
    correo?: StringNullableFilter<"Agencia"> | string | null
    telefono?: StringNullableFilter<"Agencia"> | string | null
    usuarios?: UsuarioAgenciaListRelationFilter
    clientes?: ClienteListRelationFilter
    cotizaciones?: CotizacionListRelationFilter
  }, "id">

  export type AgenciaOrderByWithAggregationInput = {
    id?: SortOrder
    nombre?: SortOrder
    correo?: SortOrderInput | SortOrder
    telefono?: SortOrderInput | SortOrder
    _count?: AgenciaCountOrderByAggregateInput
    _max?: AgenciaMaxOrderByAggregateInput
    _min?: AgenciaMinOrderByAggregateInput
  }

  export type AgenciaScalarWhereWithAggregatesInput = {
    AND?: AgenciaScalarWhereWithAggregatesInput | AgenciaScalarWhereWithAggregatesInput[]
    OR?: AgenciaScalarWhereWithAggregatesInput[]
    NOT?: AgenciaScalarWhereWithAggregatesInput | AgenciaScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Agencia"> | string
    nombre?: StringWithAggregatesFilter<"Agencia"> | string
    correo?: StringNullableWithAggregatesFilter<"Agencia"> | string | null
    telefono?: StringNullableWithAggregatesFilter<"Agencia"> | string | null
  }

  export type UsuarioAgenciaWhereInput = {
    AND?: UsuarioAgenciaWhereInput | UsuarioAgenciaWhereInput[]
    OR?: UsuarioAgenciaWhereInput[]
    NOT?: UsuarioAgenciaWhereInput | UsuarioAgenciaWhereInput[]
    id?: StringFilter<"UsuarioAgencia"> | string
    name?: StringNullableFilter<"UsuarioAgencia"> | string | null
    email?: StringNullableFilter<"UsuarioAgencia"> | string | null
    password?: StringNullableFilter<"UsuarioAgencia"> | string | null
    role?: StringFilter<"UsuarioAgencia"> | string
    agenciaId?: StringNullableFilter<"UsuarioAgencia"> | string | null
    agencia?: XOR<AgenciaNullableScalarRelationFilter, AgenciaWhereInput> | null
    cotizaciones?: CotizacionListRelationFilter
    historialCambios?: HistorialCotizacionListRelationFilter
  }

  export type UsuarioAgenciaOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    password?: SortOrderInput | SortOrder
    role?: SortOrder
    agenciaId?: SortOrderInput | SortOrder
    agencia?: AgenciaOrderByWithRelationInput
    cotizaciones?: CotizacionOrderByRelationAggregateInput
    historialCambios?: HistorialCotizacionOrderByRelationAggregateInput
  }

  export type UsuarioAgenciaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UsuarioAgenciaWhereInput | UsuarioAgenciaWhereInput[]
    OR?: UsuarioAgenciaWhereInput[]
    NOT?: UsuarioAgenciaWhereInput | UsuarioAgenciaWhereInput[]
    name?: StringNullableFilter<"UsuarioAgencia"> | string | null
    password?: StringNullableFilter<"UsuarioAgencia"> | string | null
    role?: StringFilter<"UsuarioAgencia"> | string
    agenciaId?: StringNullableFilter<"UsuarioAgencia"> | string | null
    agencia?: XOR<AgenciaNullableScalarRelationFilter, AgenciaWhereInput> | null
    cotizaciones?: CotizacionListRelationFilter
    historialCambios?: HistorialCotizacionListRelationFilter
  }, "id" | "email">

  export type UsuarioAgenciaOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    password?: SortOrderInput | SortOrder
    role?: SortOrder
    agenciaId?: SortOrderInput | SortOrder
    _count?: UsuarioAgenciaCountOrderByAggregateInput
    _max?: UsuarioAgenciaMaxOrderByAggregateInput
    _min?: UsuarioAgenciaMinOrderByAggregateInput
  }

  export type UsuarioAgenciaScalarWhereWithAggregatesInput = {
    AND?: UsuarioAgenciaScalarWhereWithAggregatesInput | UsuarioAgenciaScalarWhereWithAggregatesInput[]
    OR?: UsuarioAgenciaScalarWhereWithAggregatesInput[]
    NOT?: UsuarioAgenciaScalarWhereWithAggregatesInput | UsuarioAgenciaScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UsuarioAgencia"> | string
    name?: StringNullableWithAggregatesFilter<"UsuarioAgencia"> | string | null
    email?: StringNullableWithAggregatesFilter<"UsuarioAgencia"> | string | null
    password?: StringNullableWithAggregatesFilter<"UsuarioAgencia"> | string | null
    role?: StringWithAggregatesFilter<"UsuarioAgencia"> | string
    agenciaId?: StringNullableWithAggregatesFilter<"UsuarioAgencia"> | string | null
  }

  export type DestinoRefWhereInput = {
    AND?: DestinoRefWhereInput | DestinoRefWhereInput[]
    OR?: DestinoRefWhereInput[]
    NOT?: DestinoRefWhereInput | DestinoRefWhereInput[]
    id?: IntFilter<"DestinoRef"> | number
    pais?: StringFilter<"DestinoRef"> | string
    ciudad?: StringFilter<"DestinoRef"> | string
    tagline?: StringNullableFilter<"DestinoRef"> | string | null
    descripcion?: StringNullableFilter<"DestinoRef"> | string | null
    imagen?: StringNullableFilter<"DestinoRef"> | string | null
    color?: StringNullableFilter<"DestinoRef"> | string | null
    paquetes?: PaqueteRefListRelationFilter
  }

  export type DestinoRefOrderByWithRelationInput = {
    id?: SortOrder
    pais?: SortOrder
    ciudad?: SortOrder
    tagline?: SortOrderInput | SortOrder
    descripcion?: SortOrderInput | SortOrder
    imagen?: SortOrderInput | SortOrder
    color?: SortOrderInput | SortOrder
    paquetes?: PaqueteRefOrderByRelationAggregateInput
  }

  export type DestinoRefWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: DestinoRefWhereInput | DestinoRefWhereInput[]
    OR?: DestinoRefWhereInput[]
    NOT?: DestinoRefWhereInput | DestinoRefWhereInput[]
    pais?: StringFilter<"DestinoRef"> | string
    ciudad?: StringFilter<"DestinoRef"> | string
    tagline?: StringNullableFilter<"DestinoRef"> | string | null
    descripcion?: StringNullableFilter<"DestinoRef"> | string | null
    imagen?: StringNullableFilter<"DestinoRef"> | string | null
    color?: StringNullableFilter<"DestinoRef"> | string | null
    paquetes?: PaqueteRefListRelationFilter
  }, "id">

  export type DestinoRefOrderByWithAggregationInput = {
    id?: SortOrder
    pais?: SortOrder
    ciudad?: SortOrder
    tagline?: SortOrderInput | SortOrder
    descripcion?: SortOrderInput | SortOrder
    imagen?: SortOrderInput | SortOrder
    color?: SortOrderInput | SortOrder
    _count?: DestinoRefCountOrderByAggregateInput
    _avg?: DestinoRefAvgOrderByAggregateInput
    _max?: DestinoRefMaxOrderByAggregateInput
    _min?: DestinoRefMinOrderByAggregateInput
    _sum?: DestinoRefSumOrderByAggregateInput
  }

  export type DestinoRefScalarWhereWithAggregatesInput = {
    AND?: DestinoRefScalarWhereWithAggregatesInput | DestinoRefScalarWhereWithAggregatesInput[]
    OR?: DestinoRefScalarWhereWithAggregatesInput[]
    NOT?: DestinoRefScalarWhereWithAggregatesInput | DestinoRefScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"DestinoRef"> | number
    pais?: StringWithAggregatesFilter<"DestinoRef"> | string
    ciudad?: StringWithAggregatesFilter<"DestinoRef"> | string
    tagline?: StringNullableWithAggregatesFilter<"DestinoRef"> | string | null
    descripcion?: StringNullableWithAggregatesFilter<"DestinoRef"> | string | null
    imagen?: StringNullableWithAggregatesFilter<"DestinoRef"> | string | null
    color?: StringNullableWithAggregatesFilter<"DestinoRef"> | string | null
  }

  export type PaqueteRefWhereInput = {
    AND?: PaqueteRefWhereInput | PaqueteRefWhereInput[]
    OR?: PaqueteRefWhereInput[]
    NOT?: PaqueteRefWhereInput | PaqueteRefWhereInput[]
    id?: IntFilter<"PaqueteRef"> | number
    nombre?: StringFilter<"PaqueteRef"> | string
    descripcion?: StringNullableFilter<"PaqueteRef"> | string | null
    imagen?: StringNullableFilter<"PaqueteRef"> | string | null
    categoria?: StringNullableFilter<"PaqueteRef"> | string | null
    diasEstancia?: IntFilter<"PaqueteRef"> | number
    nochesBase?: IntFilter<"PaqueteRef"> | number
    incluyeBoleto?: BoolFilter<"PaqueteRef"> | boolean
    precioBoleto?: FloatNullableFilter<"PaqueteRef"> | number | null
    precioSGL?: FloatNullableFilter<"PaqueteRef"> | number | null
    precioDBL?: FloatNullableFilter<"PaqueteRef"> | number | null
    precioTPL?: FloatNullableFilter<"PaqueteRef"> | number | null
    precioQUAD?: FloatNullableFilter<"PaqueteRef"> | number | null
    precioPorPersona?: FloatNullableFilter<"PaqueteRef"> | number | null
    destinoId?: IntNullableFilter<"PaqueteRef"> | number | null
    destino?: XOR<DestinoRefNullableScalarRelationFilter, DestinoRefWhereInput> | null
    cotizaciones?: CotizacionListRelationFilter
  }

  export type PaqueteRefOrderByWithRelationInput = {
    id?: SortOrder
    nombre?: SortOrder
    descripcion?: SortOrderInput | SortOrder
    imagen?: SortOrderInput | SortOrder
    categoria?: SortOrderInput | SortOrder
    diasEstancia?: SortOrder
    nochesBase?: SortOrder
    incluyeBoleto?: SortOrder
    precioBoleto?: SortOrderInput | SortOrder
    precioSGL?: SortOrderInput | SortOrder
    precioDBL?: SortOrderInput | SortOrder
    precioTPL?: SortOrderInput | SortOrder
    precioQUAD?: SortOrderInput | SortOrder
    precioPorPersona?: SortOrderInput | SortOrder
    destinoId?: SortOrderInput | SortOrder
    destino?: DestinoRefOrderByWithRelationInput
    cotizaciones?: CotizacionOrderByRelationAggregateInput
  }

  export type PaqueteRefWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: PaqueteRefWhereInput | PaqueteRefWhereInput[]
    OR?: PaqueteRefWhereInput[]
    NOT?: PaqueteRefWhereInput | PaqueteRefWhereInput[]
    nombre?: StringFilter<"PaqueteRef"> | string
    descripcion?: StringNullableFilter<"PaqueteRef"> | string | null
    imagen?: StringNullableFilter<"PaqueteRef"> | string | null
    categoria?: StringNullableFilter<"PaqueteRef"> | string | null
    diasEstancia?: IntFilter<"PaqueteRef"> | number
    nochesBase?: IntFilter<"PaqueteRef"> | number
    incluyeBoleto?: BoolFilter<"PaqueteRef"> | boolean
    precioBoleto?: FloatNullableFilter<"PaqueteRef"> | number | null
    precioSGL?: FloatNullableFilter<"PaqueteRef"> | number | null
    precioDBL?: FloatNullableFilter<"PaqueteRef"> | number | null
    precioTPL?: FloatNullableFilter<"PaqueteRef"> | number | null
    precioQUAD?: FloatNullableFilter<"PaqueteRef"> | number | null
    precioPorPersona?: FloatNullableFilter<"PaqueteRef"> | number | null
    destinoId?: IntNullableFilter<"PaqueteRef"> | number | null
    destino?: XOR<DestinoRefNullableScalarRelationFilter, DestinoRefWhereInput> | null
    cotizaciones?: CotizacionListRelationFilter
  }, "id">

  export type PaqueteRefOrderByWithAggregationInput = {
    id?: SortOrder
    nombre?: SortOrder
    descripcion?: SortOrderInput | SortOrder
    imagen?: SortOrderInput | SortOrder
    categoria?: SortOrderInput | SortOrder
    diasEstancia?: SortOrder
    nochesBase?: SortOrder
    incluyeBoleto?: SortOrder
    precioBoleto?: SortOrderInput | SortOrder
    precioSGL?: SortOrderInput | SortOrder
    precioDBL?: SortOrderInput | SortOrder
    precioTPL?: SortOrderInput | SortOrder
    precioQUAD?: SortOrderInput | SortOrder
    precioPorPersona?: SortOrderInput | SortOrder
    destinoId?: SortOrderInput | SortOrder
    _count?: PaqueteRefCountOrderByAggregateInput
    _avg?: PaqueteRefAvgOrderByAggregateInput
    _max?: PaqueteRefMaxOrderByAggregateInput
    _min?: PaqueteRefMinOrderByAggregateInput
    _sum?: PaqueteRefSumOrderByAggregateInput
  }

  export type PaqueteRefScalarWhereWithAggregatesInput = {
    AND?: PaqueteRefScalarWhereWithAggregatesInput | PaqueteRefScalarWhereWithAggregatesInput[]
    OR?: PaqueteRefScalarWhereWithAggregatesInput[]
    NOT?: PaqueteRefScalarWhereWithAggregatesInput | PaqueteRefScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"PaqueteRef"> | number
    nombre?: StringWithAggregatesFilter<"PaqueteRef"> | string
    descripcion?: StringNullableWithAggregatesFilter<"PaqueteRef"> | string | null
    imagen?: StringNullableWithAggregatesFilter<"PaqueteRef"> | string | null
    categoria?: StringNullableWithAggregatesFilter<"PaqueteRef"> | string | null
    diasEstancia?: IntWithAggregatesFilter<"PaqueteRef"> | number
    nochesBase?: IntWithAggregatesFilter<"PaqueteRef"> | number
    incluyeBoleto?: BoolWithAggregatesFilter<"PaqueteRef"> | boolean
    precioBoleto?: FloatNullableWithAggregatesFilter<"PaqueteRef"> | number | null
    precioSGL?: FloatNullableWithAggregatesFilter<"PaqueteRef"> | number | null
    precioDBL?: FloatNullableWithAggregatesFilter<"PaqueteRef"> | number | null
    precioTPL?: FloatNullableWithAggregatesFilter<"PaqueteRef"> | number | null
    precioQUAD?: FloatNullableWithAggregatesFilter<"PaqueteRef"> | number | null
    precioPorPersona?: FloatNullableWithAggregatesFilter<"PaqueteRef"> | number | null
    destinoId?: IntNullableWithAggregatesFilter<"PaqueteRef"> | number | null
  }

  export type ClienteWhereInput = {
    AND?: ClienteWhereInput | ClienteWhereInput[]
    OR?: ClienteWhereInput[]
    NOT?: ClienteWhereInput | ClienteWhereInput[]
    id?: StringFilter<"Cliente"> | string
    agenciaId?: StringFilter<"Cliente"> | string
    nombre?: StringFilter<"Cliente"> | string
    email?: StringNullableFilter<"Cliente"> | string | null
    telefono?: StringNullableFilter<"Cliente"> | string | null
    documento?: StringNullableFilter<"Cliente"> | string | null
    direccion?: StringNullableFilter<"Cliente"> | string | null
    fechaAlta?: DateTimeFilter<"Cliente"> | Date | string
    agencia?: XOR<AgenciaScalarRelationFilter, AgenciaWhereInput>
    cotizaciones?: CotizacionListRelationFilter
  }

  export type ClienteOrderByWithRelationInput = {
    id?: SortOrder
    agenciaId?: SortOrder
    nombre?: SortOrder
    email?: SortOrderInput | SortOrder
    telefono?: SortOrderInput | SortOrder
    documento?: SortOrderInput | SortOrder
    direccion?: SortOrderInput | SortOrder
    fechaAlta?: SortOrder
    agencia?: AgenciaOrderByWithRelationInput
    cotizaciones?: CotizacionOrderByRelationAggregateInput
  }

  export type ClienteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    agenciaId_email?: ClienteAgenciaIdEmailCompoundUniqueInput
    agenciaId_documento?: ClienteAgenciaIdDocumentoCompoundUniqueInput
    AND?: ClienteWhereInput | ClienteWhereInput[]
    OR?: ClienteWhereInput[]
    NOT?: ClienteWhereInput | ClienteWhereInput[]
    agenciaId?: StringFilter<"Cliente"> | string
    nombre?: StringFilter<"Cliente"> | string
    email?: StringNullableFilter<"Cliente"> | string | null
    telefono?: StringNullableFilter<"Cliente"> | string | null
    documento?: StringNullableFilter<"Cliente"> | string | null
    direccion?: StringNullableFilter<"Cliente"> | string | null
    fechaAlta?: DateTimeFilter<"Cliente"> | Date | string
    agencia?: XOR<AgenciaScalarRelationFilter, AgenciaWhereInput>
    cotizaciones?: CotizacionListRelationFilter
  }, "id" | "agenciaId_email" | "agenciaId_documento">

  export type ClienteOrderByWithAggregationInput = {
    id?: SortOrder
    agenciaId?: SortOrder
    nombre?: SortOrder
    email?: SortOrderInput | SortOrder
    telefono?: SortOrderInput | SortOrder
    documento?: SortOrderInput | SortOrder
    direccion?: SortOrderInput | SortOrder
    fechaAlta?: SortOrder
    _count?: ClienteCountOrderByAggregateInput
    _max?: ClienteMaxOrderByAggregateInput
    _min?: ClienteMinOrderByAggregateInput
  }

  export type ClienteScalarWhereWithAggregatesInput = {
    AND?: ClienteScalarWhereWithAggregatesInput | ClienteScalarWhereWithAggregatesInput[]
    OR?: ClienteScalarWhereWithAggregatesInput[]
    NOT?: ClienteScalarWhereWithAggregatesInput | ClienteScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Cliente"> | string
    agenciaId?: StringWithAggregatesFilter<"Cliente"> | string
    nombre?: StringWithAggregatesFilter<"Cliente"> | string
    email?: StringNullableWithAggregatesFilter<"Cliente"> | string | null
    telefono?: StringNullableWithAggregatesFilter<"Cliente"> | string | null
    documento?: StringNullableWithAggregatesFilter<"Cliente"> | string | null
    direccion?: StringNullableWithAggregatesFilter<"Cliente"> | string | null
    fechaAlta?: DateTimeWithAggregatesFilter<"Cliente"> | Date | string
  }

  export type CotizacionWhereInput = {
    AND?: CotizacionWhereInput | CotizacionWhereInput[]
    OR?: CotizacionWhereInput[]
    NOT?: CotizacionWhereInput | CotizacionWhereInput[]
    id?: StringFilter<"Cotizacion"> | string
    codigo?: StringFilter<"Cotizacion"> | string
    agenciaId?: StringFilter<"Cotizacion"> | string
    creadoPorId?: StringFilter<"Cotizacion"> | string
    paqueteId?: IntFilter<"Cotizacion"> | number
    clienteId?: StringFilter<"Cotizacion"> | string
    paqueteNombre?: StringFilter<"Cotizacion"> | string
    paqueteDuracion?: StringFilter<"Cotizacion"> | string
    paqueteDestino?: StringFilter<"Cotizacion"> | string
    paqueteIncluye?: StringNullableListFilter<"Cotizacion">
    incluyeBoleto?: BoolFilter<"Cotizacion"> | boolean
    cantSGL?: IntFilter<"Cotizacion"> | number
    cantDBL?: IntFilter<"Cotizacion"> | number
    cantTPL?: IntFilter<"Cotizacion"> | number
    cantQUAD?: IntFilter<"Cotizacion"> | number
    cantCHD?: IntFilter<"Cotizacion"> | number
    precioSGL?: FloatNullableFilter<"Cotizacion"> | number | null
    precioDBL?: FloatNullableFilter<"Cotizacion"> | number | null
    precioTPL?: FloatNullableFilter<"Cotizacion"> | number | null
    precioQUAD?: FloatNullableFilter<"Cotizacion"> | number | null
    precioCHD?: FloatNullableFilter<"Cotizacion"> | number | null
    precioBoleto?: FloatNullableFilter<"Cotizacion"> | number | null
    subtotal?: FloatFilter<"Cotizacion"> | number
    markup?: FloatFilter<"Cotizacion"> | number
    total?: FloatFilter<"Cotizacion"> | number
    fechaViaje?: DateTimeNullableFilter<"Cotizacion"> | Date | string | null
    fechaRetorno?: DateTimeNullableFilter<"Cotizacion"> | Date | string | null
    status?: EnumCotizacionStatusFilter<"Cotizacion"> | $Enums.CotizacionStatus
    notas?: StringNullableFilter<"Cotizacion"> | string | null
    tokenAprobacion?: StringNullableFilter<"Cotizacion"> | string | null
    fechaCreacion?: DateTimeFilter<"Cotizacion"> | Date | string
    fechaEnvio?: DateTimeNullableFilter<"Cotizacion"> | Date | string | null
    fechaAprobacion?: DateTimeNullableFilter<"Cotizacion"> | Date | string | null
    fechaVencimiento?: DateTimeNullableFilter<"Cotizacion"> | Date | string | null
    agencia?: XOR<AgenciaScalarRelationFilter, AgenciaWhereInput>
    creadoPor?: XOR<UsuarioAgenciaScalarRelationFilter, UsuarioAgenciaWhereInput>
    paquete?: XOR<PaqueteRefScalarRelationFilter, PaqueteRefWhereInput>
    cliente?: XOR<ClienteScalarRelationFilter, ClienteWhereInput>
    historial?: HistorialCotizacionListRelationFilter
  }

  export type CotizacionOrderByWithRelationInput = {
    id?: SortOrder
    codigo?: SortOrder
    agenciaId?: SortOrder
    creadoPorId?: SortOrder
    paqueteId?: SortOrder
    clienteId?: SortOrder
    paqueteNombre?: SortOrder
    paqueteDuracion?: SortOrder
    paqueteDestino?: SortOrder
    paqueteIncluye?: SortOrder
    incluyeBoleto?: SortOrder
    cantSGL?: SortOrder
    cantDBL?: SortOrder
    cantTPL?: SortOrder
    cantQUAD?: SortOrder
    cantCHD?: SortOrder
    precioSGL?: SortOrderInput | SortOrder
    precioDBL?: SortOrderInput | SortOrder
    precioTPL?: SortOrderInput | SortOrder
    precioQUAD?: SortOrderInput | SortOrder
    precioCHD?: SortOrderInput | SortOrder
    precioBoleto?: SortOrderInput | SortOrder
    subtotal?: SortOrder
    markup?: SortOrder
    total?: SortOrder
    fechaViaje?: SortOrderInput | SortOrder
    fechaRetorno?: SortOrderInput | SortOrder
    status?: SortOrder
    notas?: SortOrderInput | SortOrder
    tokenAprobacion?: SortOrderInput | SortOrder
    fechaCreacion?: SortOrder
    fechaEnvio?: SortOrderInput | SortOrder
    fechaAprobacion?: SortOrderInput | SortOrder
    fechaVencimiento?: SortOrderInput | SortOrder
    agencia?: AgenciaOrderByWithRelationInput
    creadoPor?: UsuarioAgenciaOrderByWithRelationInput
    paquete?: PaqueteRefOrderByWithRelationInput
    cliente?: ClienteOrderByWithRelationInput
    historial?: HistorialCotizacionOrderByRelationAggregateInput
  }

  export type CotizacionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    codigo?: string
    tokenAprobacion?: string
    AND?: CotizacionWhereInput | CotizacionWhereInput[]
    OR?: CotizacionWhereInput[]
    NOT?: CotizacionWhereInput | CotizacionWhereInput[]
    agenciaId?: StringFilter<"Cotizacion"> | string
    creadoPorId?: StringFilter<"Cotizacion"> | string
    paqueteId?: IntFilter<"Cotizacion"> | number
    clienteId?: StringFilter<"Cotizacion"> | string
    paqueteNombre?: StringFilter<"Cotizacion"> | string
    paqueteDuracion?: StringFilter<"Cotizacion"> | string
    paqueteDestino?: StringFilter<"Cotizacion"> | string
    paqueteIncluye?: StringNullableListFilter<"Cotizacion">
    incluyeBoleto?: BoolFilter<"Cotizacion"> | boolean
    cantSGL?: IntFilter<"Cotizacion"> | number
    cantDBL?: IntFilter<"Cotizacion"> | number
    cantTPL?: IntFilter<"Cotizacion"> | number
    cantQUAD?: IntFilter<"Cotizacion"> | number
    cantCHD?: IntFilter<"Cotizacion"> | number
    precioSGL?: FloatNullableFilter<"Cotizacion"> | number | null
    precioDBL?: FloatNullableFilter<"Cotizacion"> | number | null
    precioTPL?: FloatNullableFilter<"Cotizacion"> | number | null
    precioQUAD?: FloatNullableFilter<"Cotizacion"> | number | null
    precioCHD?: FloatNullableFilter<"Cotizacion"> | number | null
    precioBoleto?: FloatNullableFilter<"Cotizacion"> | number | null
    subtotal?: FloatFilter<"Cotizacion"> | number
    markup?: FloatFilter<"Cotizacion"> | number
    total?: FloatFilter<"Cotizacion"> | number
    fechaViaje?: DateTimeNullableFilter<"Cotizacion"> | Date | string | null
    fechaRetorno?: DateTimeNullableFilter<"Cotizacion"> | Date | string | null
    status?: EnumCotizacionStatusFilter<"Cotizacion"> | $Enums.CotizacionStatus
    notas?: StringNullableFilter<"Cotizacion"> | string | null
    fechaCreacion?: DateTimeFilter<"Cotizacion"> | Date | string
    fechaEnvio?: DateTimeNullableFilter<"Cotizacion"> | Date | string | null
    fechaAprobacion?: DateTimeNullableFilter<"Cotizacion"> | Date | string | null
    fechaVencimiento?: DateTimeNullableFilter<"Cotizacion"> | Date | string | null
    agencia?: XOR<AgenciaScalarRelationFilter, AgenciaWhereInput>
    creadoPor?: XOR<UsuarioAgenciaScalarRelationFilter, UsuarioAgenciaWhereInput>
    paquete?: XOR<PaqueteRefScalarRelationFilter, PaqueteRefWhereInput>
    cliente?: XOR<ClienteScalarRelationFilter, ClienteWhereInput>
    historial?: HistorialCotizacionListRelationFilter
  }, "id" | "codigo" | "tokenAprobacion">

  export type CotizacionOrderByWithAggregationInput = {
    id?: SortOrder
    codigo?: SortOrder
    agenciaId?: SortOrder
    creadoPorId?: SortOrder
    paqueteId?: SortOrder
    clienteId?: SortOrder
    paqueteNombre?: SortOrder
    paqueteDuracion?: SortOrder
    paqueteDestino?: SortOrder
    paqueteIncluye?: SortOrder
    incluyeBoleto?: SortOrder
    cantSGL?: SortOrder
    cantDBL?: SortOrder
    cantTPL?: SortOrder
    cantQUAD?: SortOrder
    cantCHD?: SortOrder
    precioSGL?: SortOrderInput | SortOrder
    precioDBL?: SortOrderInput | SortOrder
    precioTPL?: SortOrderInput | SortOrder
    precioQUAD?: SortOrderInput | SortOrder
    precioCHD?: SortOrderInput | SortOrder
    precioBoleto?: SortOrderInput | SortOrder
    subtotal?: SortOrder
    markup?: SortOrder
    total?: SortOrder
    fechaViaje?: SortOrderInput | SortOrder
    fechaRetorno?: SortOrderInput | SortOrder
    status?: SortOrder
    notas?: SortOrderInput | SortOrder
    tokenAprobacion?: SortOrderInput | SortOrder
    fechaCreacion?: SortOrder
    fechaEnvio?: SortOrderInput | SortOrder
    fechaAprobacion?: SortOrderInput | SortOrder
    fechaVencimiento?: SortOrderInput | SortOrder
    _count?: CotizacionCountOrderByAggregateInput
    _avg?: CotizacionAvgOrderByAggregateInput
    _max?: CotizacionMaxOrderByAggregateInput
    _min?: CotizacionMinOrderByAggregateInput
    _sum?: CotizacionSumOrderByAggregateInput
  }

  export type CotizacionScalarWhereWithAggregatesInput = {
    AND?: CotizacionScalarWhereWithAggregatesInput | CotizacionScalarWhereWithAggregatesInput[]
    OR?: CotizacionScalarWhereWithAggregatesInput[]
    NOT?: CotizacionScalarWhereWithAggregatesInput | CotizacionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Cotizacion"> | string
    codigo?: StringWithAggregatesFilter<"Cotizacion"> | string
    agenciaId?: StringWithAggregatesFilter<"Cotizacion"> | string
    creadoPorId?: StringWithAggregatesFilter<"Cotizacion"> | string
    paqueteId?: IntWithAggregatesFilter<"Cotizacion"> | number
    clienteId?: StringWithAggregatesFilter<"Cotizacion"> | string
    paqueteNombre?: StringWithAggregatesFilter<"Cotizacion"> | string
    paqueteDuracion?: StringWithAggregatesFilter<"Cotizacion"> | string
    paqueteDestino?: StringWithAggregatesFilter<"Cotizacion"> | string
    paqueteIncluye?: StringNullableListFilter<"Cotizacion">
    incluyeBoleto?: BoolWithAggregatesFilter<"Cotizacion"> | boolean
    cantSGL?: IntWithAggregatesFilter<"Cotizacion"> | number
    cantDBL?: IntWithAggregatesFilter<"Cotizacion"> | number
    cantTPL?: IntWithAggregatesFilter<"Cotizacion"> | number
    cantQUAD?: IntWithAggregatesFilter<"Cotizacion"> | number
    cantCHD?: IntWithAggregatesFilter<"Cotizacion"> | number
    precioSGL?: FloatNullableWithAggregatesFilter<"Cotizacion"> | number | null
    precioDBL?: FloatNullableWithAggregatesFilter<"Cotizacion"> | number | null
    precioTPL?: FloatNullableWithAggregatesFilter<"Cotizacion"> | number | null
    precioQUAD?: FloatNullableWithAggregatesFilter<"Cotizacion"> | number | null
    precioCHD?: FloatNullableWithAggregatesFilter<"Cotizacion"> | number | null
    precioBoleto?: FloatNullableWithAggregatesFilter<"Cotizacion"> | number | null
    subtotal?: FloatWithAggregatesFilter<"Cotizacion"> | number
    markup?: FloatWithAggregatesFilter<"Cotizacion"> | number
    total?: FloatWithAggregatesFilter<"Cotizacion"> | number
    fechaViaje?: DateTimeNullableWithAggregatesFilter<"Cotizacion"> | Date | string | null
    fechaRetorno?: DateTimeNullableWithAggregatesFilter<"Cotizacion"> | Date | string | null
    status?: EnumCotizacionStatusWithAggregatesFilter<"Cotizacion"> | $Enums.CotizacionStatus
    notas?: StringNullableWithAggregatesFilter<"Cotizacion"> | string | null
    tokenAprobacion?: StringNullableWithAggregatesFilter<"Cotizacion"> | string | null
    fechaCreacion?: DateTimeWithAggregatesFilter<"Cotizacion"> | Date | string
    fechaEnvio?: DateTimeNullableWithAggregatesFilter<"Cotizacion"> | Date | string | null
    fechaAprobacion?: DateTimeNullableWithAggregatesFilter<"Cotizacion"> | Date | string | null
    fechaVencimiento?: DateTimeNullableWithAggregatesFilter<"Cotizacion"> | Date | string | null
  }

  export type HistorialCotizacionWhereInput = {
    AND?: HistorialCotizacionWhereInput | HistorialCotizacionWhereInput[]
    OR?: HistorialCotizacionWhereInput[]
    NOT?: HistorialCotizacionWhereInput | HistorialCotizacionWhereInput[]
    id?: StringFilter<"HistorialCotizacion"> | string
    cotizacionId?: StringFilter<"HistorialCotizacion"> | string
    cambiadoPorId?: StringFilter<"HistorialCotizacion"> | string
    statusAnterior?: EnumCotizacionStatusNullableFilter<"HistorialCotizacion"> | $Enums.CotizacionStatus | null
    statusNuevo?: EnumCotizacionStatusFilter<"HistorialCotizacion"> | $Enums.CotizacionStatus
    nota?: StringNullableFilter<"HistorialCotizacion"> | string | null
    fecha?: DateTimeFilter<"HistorialCotizacion"> | Date | string
    cotizacion?: XOR<CotizacionScalarRelationFilter, CotizacionWhereInput>
    cambiadoPor?: XOR<UsuarioAgenciaScalarRelationFilter, UsuarioAgenciaWhereInput>
  }

  export type HistorialCotizacionOrderByWithRelationInput = {
    id?: SortOrder
    cotizacionId?: SortOrder
    cambiadoPorId?: SortOrder
    statusAnterior?: SortOrderInput | SortOrder
    statusNuevo?: SortOrder
    nota?: SortOrderInput | SortOrder
    fecha?: SortOrder
    cotizacion?: CotizacionOrderByWithRelationInput
    cambiadoPor?: UsuarioAgenciaOrderByWithRelationInput
  }

  export type HistorialCotizacionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: HistorialCotizacionWhereInput | HistorialCotizacionWhereInput[]
    OR?: HistorialCotizacionWhereInput[]
    NOT?: HistorialCotizacionWhereInput | HistorialCotizacionWhereInput[]
    cotizacionId?: StringFilter<"HistorialCotizacion"> | string
    cambiadoPorId?: StringFilter<"HistorialCotizacion"> | string
    statusAnterior?: EnumCotizacionStatusNullableFilter<"HistorialCotizacion"> | $Enums.CotizacionStatus | null
    statusNuevo?: EnumCotizacionStatusFilter<"HistorialCotizacion"> | $Enums.CotizacionStatus
    nota?: StringNullableFilter<"HistorialCotizacion"> | string | null
    fecha?: DateTimeFilter<"HistorialCotizacion"> | Date | string
    cotizacion?: XOR<CotizacionScalarRelationFilter, CotizacionWhereInput>
    cambiadoPor?: XOR<UsuarioAgenciaScalarRelationFilter, UsuarioAgenciaWhereInput>
  }, "id">

  export type HistorialCotizacionOrderByWithAggregationInput = {
    id?: SortOrder
    cotizacionId?: SortOrder
    cambiadoPorId?: SortOrder
    statusAnterior?: SortOrderInput | SortOrder
    statusNuevo?: SortOrder
    nota?: SortOrderInput | SortOrder
    fecha?: SortOrder
    _count?: HistorialCotizacionCountOrderByAggregateInput
    _max?: HistorialCotizacionMaxOrderByAggregateInput
    _min?: HistorialCotizacionMinOrderByAggregateInput
  }

  export type HistorialCotizacionScalarWhereWithAggregatesInput = {
    AND?: HistorialCotizacionScalarWhereWithAggregatesInput | HistorialCotizacionScalarWhereWithAggregatesInput[]
    OR?: HistorialCotizacionScalarWhereWithAggregatesInput[]
    NOT?: HistorialCotizacionScalarWhereWithAggregatesInput | HistorialCotizacionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"HistorialCotizacion"> | string
    cotizacionId?: StringWithAggregatesFilter<"HistorialCotizacion"> | string
    cambiadoPorId?: StringWithAggregatesFilter<"HistorialCotizacion"> | string
    statusAnterior?: EnumCotizacionStatusNullableWithAggregatesFilter<"HistorialCotizacion"> | $Enums.CotizacionStatus | null
    statusNuevo?: EnumCotizacionStatusWithAggregatesFilter<"HistorialCotizacion"> | $Enums.CotizacionStatus
    nota?: StringNullableWithAggregatesFilter<"HistorialCotizacion"> | string | null
    fecha?: DateTimeWithAggregatesFilter<"HistorialCotizacion"> | Date | string
  }

  export type AgenciaCreateInput = {
    id: string
    nombre: string
    correo?: string | null
    telefono?: string | null
    usuarios?: UsuarioAgenciaCreateNestedManyWithoutAgenciaInput
    clientes?: ClienteCreateNestedManyWithoutAgenciaInput
    cotizaciones?: CotizacionCreateNestedManyWithoutAgenciaInput
  }

  export type AgenciaUncheckedCreateInput = {
    id: string
    nombre: string
    correo?: string | null
    telefono?: string | null
    usuarios?: UsuarioAgenciaUncheckedCreateNestedManyWithoutAgenciaInput
    clientes?: ClienteUncheckedCreateNestedManyWithoutAgenciaInput
    cotizaciones?: CotizacionUncheckedCreateNestedManyWithoutAgenciaInput
  }

  export type AgenciaUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    correo?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    usuarios?: UsuarioAgenciaUpdateManyWithoutAgenciaNestedInput
    clientes?: ClienteUpdateManyWithoutAgenciaNestedInput
    cotizaciones?: CotizacionUpdateManyWithoutAgenciaNestedInput
  }

  export type AgenciaUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    correo?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    usuarios?: UsuarioAgenciaUncheckedUpdateManyWithoutAgenciaNestedInput
    clientes?: ClienteUncheckedUpdateManyWithoutAgenciaNestedInput
    cotizaciones?: CotizacionUncheckedUpdateManyWithoutAgenciaNestedInput
  }

  export type AgenciaCreateManyInput = {
    id: string
    nombre: string
    correo?: string | null
    telefono?: string | null
  }

  export type AgenciaUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    correo?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AgenciaUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    correo?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UsuarioAgenciaCreateInput = {
    id: string
    name?: string | null
    email?: string | null
    password?: string | null
    role: string
    agencia?: AgenciaCreateNestedOneWithoutUsuariosInput
    cotizaciones?: CotizacionCreateNestedManyWithoutCreadoPorInput
    historialCambios?: HistorialCotizacionCreateNestedManyWithoutCambiadoPorInput
  }

  export type UsuarioAgenciaUncheckedCreateInput = {
    id: string
    name?: string | null
    email?: string | null
    password?: string | null
    role: string
    agenciaId?: string | null
    cotizaciones?: CotizacionUncheckedCreateNestedManyWithoutCreadoPorInput
    historialCambios?: HistorialCotizacionUncheckedCreateNestedManyWithoutCambiadoPorInput
  }

  export type UsuarioAgenciaUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    agencia?: AgenciaUpdateOneWithoutUsuariosNestedInput
    cotizaciones?: CotizacionUpdateManyWithoutCreadoPorNestedInput
    historialCambios?: HistorialCotizacionUpdateManyWithoutCambiadoPorNestedInput
  }

  export type UsuarioAgenciaUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    agenciaId?: NullableStringFieldUpdateOperationsInput | string | null
    cotizaciones?: CotizacionUncheckedUpdateManyWithoutCreadoPorNestedInput
    historialCambios?: HistorialCotizacionUncheckedUpdateManyWithoutCambiadoPorNestedInput
  }

  export type UsuarioAgenciaCreateManyInput = {
    id: string
    name?: string | null
    email?: string | null
    password?: string | null
    role: string
    agenciaId?: string | null
  }

  export type UsuarioAgenciaUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
  }

  export type UsuarioAgenciaUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    agenciaId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DestinoRefCreateInput = {
    id: number
    pais: string
    ciudad: string
    tagline?: string | null
    descripcion?: string | null
    imagen?: string | null
    color?: string | null
    paquetes?: PaqueteRefCreateNestedManyWithoutDestinoInput
  }

  export type DestinoRefUncheckedCreateInput = {
    id: number
    pais: string
    ciudad: string
    tagline?: string | null
    descripcion?: string | null
    imagen?: string | null
    color?: string | null
    paquetes?: PaqueteRefUncheckedCreateNestedManyWithoutDestinoInput
  }

  export type DestinoRefUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    pais?: StringFieldUpdateOperationsInput | string
    ciudad?: StringFieldUpdateOperationsInput | string
    tagline?: NullableStringFieldUpdateOperationsInput | string | null
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    imagen?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    paquetes?: PaqueteRefUpdateManyWithoutDestinoNestedInput
  }

  export type DestinoRefUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    pais?: StringFieldUpdateOperationsInput | string
    ciudad?: StringFieldUpdateOperationsInput | string
    tagline?: NullableStringFieldUpdateOperationsInput | string | null
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    imagen?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    paquetes?: PaqueteRefUncheckedUpdateManyWithoutDestinoNestedInput
  }

  export type DestinoRefCreateManyInput = {
    id: number
    pais: string
    ciudad: string
    tagline?: string | null
    descripcion?: string | null
    imagen?: string | null
    color?: string | null
  }

  export type DestinoRefUpdateManyMutationInput = {
    id?: IntFieldUpdateOperationsInput | number
    pais?: StringFieldUpdateOperationsInput | string
    ciudad?: StringFieldUpdateOperationsInput | string
    tagline?: NullableStringFieldUpdateOperationsInput | string | null
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    imagen?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DestinoRefUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    pais?: StringFieldUpdateOperationsInput | string
    ciudad?: StringFieldUpdateOperationsInput | string
    tagline?: NullableStringFieldUpdateOperationsInput | string | null
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    imagen?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PaqueteRefCreateInput = {
    id: number
    nombre: string
    descripcion?: string | null
    imagen?: string | null
    categoria?: string | null
    diasEstancia: number
    nochesBase: number
    incluyeBoleto: boolean
    precioBoleto?: number | null
    precioSGL?: number | null
    precioDBL?: number | null
    precioTPL?: number | null
    precioQUAD?: number | null
    precioPorPersona?: number | null
    destino?: DestinoRefCreateNestedOneWithoutPaquetesInput
    cotizaciones?: CotizacionCreateNestedManyWithoutPaqueteInput
  }

  export type PaqueteRefUncheckedCreateInput = {
    id: number
    nombre: string
    descripcion?: string | null
    imagen?: string | null
    categoria?: string | null
    diasEstancia: number
    nochesBase: number
    incluyeBoleto: boolean
    precioBoleto?: number | null
    precioSGL?: number | null
    precioDBL?: number | null
    precioTPL?: number | null
    precioQUAD?: number | null
    precioPorPersona?: number | null
    destinoId?: number | null
    cotizaciones?: CotizacionUncheckedCreateNestedManyWithoutPaqueteInput
  }

  export type PaqueteRefUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    nombre?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    imagen?: NullableStringFieldUpdateOperationsInput | string | null
    categoria?: NullableStringFieldUpdateOperationsInput | string | null
    diasEstancia?: IntFieldUpdateOperationsInput | number
    nochesBase?: IntFieldUpdateOperationsInput | number
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioPorPersona?: NullableFloatFieldUpdateOperationsInput | number | null
    destino?: DestinoRefUpdateOneWithoutPaquetesNestedInput
    cotizaciones?: CotizacionUpdateManyWithoutPaqueteNestedInput
  }

  export type PaqueteRefUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    nombre?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    imagen?: NullableStringFieldUpdateOperationsInput | string | null
    categoria?: NullableStringFieldUpdateOperationsInput | string | null
    diasEstancia?: IntFieldUpdateOperationsInput | number
    nochesBase?: IntFieldUpdateOperationsInput | number
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioPorPersona?: NullableFloatFieldUpdateOperationsInput | number | null
    destinoId?: NullableIntFieldUpdateOperationsInput | number | null
    cotizaciones?: CotizacionUncheckedUpdateManyWithoutPaqueteNestedInput
  }

  export type PaqueteRefCreateManyInput = {
    id: number
    nombre: string
    descripcion?: string | null
    imagen?: string | null
    categoria?: string | null
    diasEstancia: number
    nochesBase: number
    incluyeBoleto: boolean
    precioBoleto?: number | null
    precioSGL?: number | null
    precioDBL?: number | null
    precioTPL?: number | null
    precioQUAD?: number | null
    precioPorPersona?: number | null
    destinoId?: number | null
  }

  export type PaqueteRefUpdateManyMutationInput = {
    id?: IntFieldUpdateOperationsInput | number
    nombre?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    imagen?: NullableStringFieldUpdateOperationsInput | string | null
    categoria?: NullableStringFieldUpdateOperationsInput | string | null
    diasEstancia?: IntFieldUpdateOperationsInput | number
    nochesBase?: IntFieldUpdateOperationsInput | number
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioPorPersona?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type PaqueteRefUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    nombre?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    imagen?: NullableStringFieldUpdateOperationsInput | string | null
    categoria?: NullableStringFieldUpdateOperationsInput | string | null
    diasEstancia?: IntFieldUpdateOperationsInput | number
    nochesBase?: IntFieldUpdateOperationsInput | number
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioPorPersona?: NullableFloatFieldUpdateOperationsInput | number | null
    destinoId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type ClienteCreateInput = {
    id?: string
    nombre: string
    email?: string | null
    telefono?: string | null
    documento?: string | null
    direccion?: string | null
    fechaAlta?: Date | string
    agencia: AgenciaCreateNestedOneWithoutClientesInput
    cotizaciones?: CotizacionCreateNestedManyWithoutClienteInput
  }

  export type ClienteUncheckedCreateInput = {
    id?: string
    agenciaId: string
    nombre: string
    email?: string | null
    telefono?: string | null
    documento?: string | null
    direccion?: string | null
    fechaAlta?: Date | string
    cotizaciones?: CotizacionUncheckedCreateNestedManyWithoutClienteInput
  }

  export type ClienteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    documento?: NullableStringFieldUpdateOperationsInput | string | null
    direccion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaAlta?: DateTimeFieldUpdateOperationsInput | Date | string
    agencia?: AgenciaUpdateOneRequiredWithoutClientesNestedInput
    cotizaciones?: CotizacionUpdateManyWithoutClienteNestedInput
  }

  export type ClienteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    agenciaId?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    documento?: NullableStringFieldUpdateOperationsInput | string | null
    direccion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaAlta?: DateTimeFieldUpdateOperationsInput | Date | string
    cotizaciones?: CotizacionUncheckedUpdateManyWithoutClienteNestedInput
  }

  export type ClienteCreateManyInput = {
    id?: string
    agenciaId: string
    nombre: string
    email?: string | null
    telefono?: string | null
    documento?: string | null
    direccion?: string | null
    fechaAlta?: Date | string
  }

  export type ClienteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    documento?: NullableStringFieldUpdateOperationsInput | string | null
    direccion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaAlta?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClienteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    agenciaId?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    documento?: NullableStringFieldUpdateOperationsInput | string | null
    direccion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaAlta?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CotizacionCreateInput = {
    id?: string
    codigo: string
    paqueteNombre: string
    paqueteDuracion: string
    paqueteDestino: string
    paqueteIncluye?: CotizacionCreatepaqueteIncluyeInput | string[]
    incluyeBoleto?: boolean
    cantSGL?: number
    cantDBL?: number
    cantTPL?: number
    cantQUAD?: number
    cantCHD?: number
    precioSGL?: number | null
    precioDBL?: number | null
    precioTPL?: number | null
    precioQUAD?: number | null
    precioCHD?: number | null
    precioBoleto?: number | null
    subtotal: number
    markup?: number
    total: number
    fechaViaje?: Date | string | null
    fechaRetorno?: Date | string | null
    status?: $Enums.CotizacionStatus
    notas?: string | null
    tokenAprobacion?: string | null
    fechaCreacion?: Date | string
    fechaEnvio?: Date | string | null
    fechaAprobacion?: Date | string | null
    fechaVencimiento?: Date | string | null
    agencia: AgenciaCreateNestedOneWithoutCotizacionesInput
    creadoPor: UsuarioAgenciaCreateNestedOneWithoutCotizacionesInput
    paquete: PaqueteRefCreateNestedOneWithoutCotizacionesInput
    cliente: ClienteCreateNestedOneWithoutCotizacionesInput
    historial?: HistorialCotizacionCreateNestedManyWithoutCotizacionInput
  }

  export type CotizacionUncheckedCreateInput = {
    id?: string
    codigo: string
    agenciaId: string
    creadoPorId: string
    paqueteId: number
    clienteId: string
    paqueteNombre: string
    paqueteDuracion: string
    paqueteDestino: string
    paqueteIncluye?: CotizacionCreatepaqueteIncluyeInput | string[]
    incluyeBoleto?: boolean
    cantSGL?: number
    cantDBL?: number
    cantTPL?: number
    cantQUAD?: number
    cantCHD?: number
    precioSGL?: number | null
    precioDBL?: number | null
    precioTPL?: number | null
    precioQUAD?: number | null
    precioCHD?: number | null
    precioBoleto?: number | null
    subtotal: number
    markup?: number
    total: number
    fechaViaje?: Date | string | null
    fechaRetorno?: Date | string | null
    status?: $Enums.CotizacionStatus
    notas?: string | null
    tokenAprobacion?: string | null
    fechaCreacion?: Date | string
    fechaEnvio?: Date | string | null
    fechaAprobacion?: Date | string | null
    fechaVencimiento?: Date | string | null
    historial?: HistorialCotizacionUncheckedCreateNestedManyWithoutCotizacionInput
  }

  export type CotizacionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    paqueteNombre?: StringFieldUpdateOperationsInput | string
    paqueteDuracion?: StringFieldUpdateOperationsInput | string
    paqueteDestino?: StringFieldUpdateOperationsInput | string
    paqueteIncluye?: CotizacionUpdatepaqueteIncluyeInput | string[]
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    cantSGL?: IntFieldUpdateOperationsInput | number
    cantDBL?: IntFieldUpdateOperationsInput | number
    cantTPL?: IntFieldUpdateOperationsInput | number
    cantQUAD?: IntFieldUpdateOperationsInput | number
    cantCHD?: IntFieldUpdateOperationsInput | number
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioCHD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    subtotal?: FloatFieldUpdateOperationsInput | number
    markup?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    fechaViaje?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaRetorno?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    tokenAprobacion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaEnvio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaAprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    agencia?: AgenciaUpdateOneRequiredWithoutCotizacionesNestedInput
    creadoPor?: UsuarioAgenciaUpdateOneRequiredWithoutCotizacionesNestedInput
    paquete?: PaqueteRefUpdateOneRequiredWithoutCotizacionesNestedInput
    cliente?: ClienteUpdateOneRequiredWithoutCotizacionesNestedInput
    historial?: HistorialCotizacionUpdateManyWithoutCotizacionNestedInput
  }

  export type CotizacionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    agenciaId?: StringFieldUpdateOperationsInput | string
    creadoPorId?: StringFieldUpdateOperationsInput | string
    paqueteId?: IntFieldUpdateOperationsInput | number
    clienteId?: StringFieldUpdateOperationsInput | string
    paqueteNombre?: StringFieldUpdateOperationsInput | string
    paqueteDuracion?: StringFieldUpdateOperationsInput | string
    paqueteDestino?: StringFieldUpdateOperationsInput | string
    paqueteIncluye?: CotizacionUpdatepaqueteIncluyeInput | string[]
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    cantSGL?: IntFieldUpdateOperationsInput | number
    cantDBL?: IntFieldUpdateOperationsInput | number
    cantTPL?: IntFieldUpdateOperationsInput | number
    cantQUAD?: IntFieldUpdateOperationsInput | number
    cantCHD?: IntFieldUpdateOperationsInput | number
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioCHD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    subtotal?: FloatFieldUpdateOperationsInput | number
    markup?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    fechaViaje?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaRetorno?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    tokenAprobacion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaEnvio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaAprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    historial?: HistorialCotizacionUncheckedUpdateManyWithoutCotizacionNestedInput
  }

  export type CotizacionCreateManyInput = {
    id?: string
    codigo: string
    agenciaId: string
    creadoPorId: string
    paqueteId: number
    clienteId: string
    paqueteNombre: string
    paqueteDuracion: string
    paqueteDestino: string
    paqueteIncluye?: CotizacionCreatepaqueteIncluyeInput | string[]
    incluyeBoleto?: boolean
    cantSGL?: number
    cantDBL?: number
    cantTPL?: number
    cantQUAD?: number
    cantCHD?: number
    precioSGL?: number | null
    precioDBL?: number | null
    precioTPL?: number | null
    precioQUAD?: number | null
    precioCHD?: number | null
    precioBoleto?: number | null
    subtotal: number
    markup?: number
    total: number
    fechaViaje?: Date | string | null
    fechaRetorno?: Date | string | null
    status?: $Enums.CotizacionStatus
    notas?: string | null
    tokenAprobacion?: string | null
    fechaCreacion?: Date | string
    fechaEnvio?: Date | string | null
    fechaAprobacion?: Date | string | null
    fechaVencimiento?: Date | string | null
  }

  export type CotizacionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    paqueteNombre?: StringFieldUpdateOperationsInput | string
    paqueteDuracion?: StringFieldUpdateOperationsInput | string
    paqueteDestino?: StringFieldUpdateOperationsInput | string
    paqueteIncluye?: CotizacionUpdatepaqueteIncluyeInput | string[]
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    cantSGL?: IntFieldUpdateOperationsInput | number
    cantDBL?: IntFieldUpdateOperationsInput | number
    cantTPL?: IntFieldUpdateOperationsInput | number
    cantQUAD?: IntFieldUpdateOperationsInput | number
    cantCHD?: IntFieldUpdateOperationsInput | number
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioCHD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    subtotal?: FloatFieldUpdateOperationsInput | number
    markup?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    fechaViaje?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaRetorno?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    tokenAprobacion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaEnvio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaAprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CotizacionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    agenciaId?: StringFieldUpdateOperationsInput | string
    creadoPorId?: StringFieldUpdateOperationsInput | string
    paqueteId?: IntFieldUpdateOperationsInput | number
    clienteId?: StringFieldUpdateOperationsInput | string
    paqueteNombre?: StringFieldUpdateOperationsInput | string
    paqueteDuracion?: StringFieldUpdateOperationsInput | string
    paqueteDestino?: StringFieldUpdateOperationsInput | string
    paqueteIncluye?: CotizacionUpdatepaqueteIncluyeInput | string[]
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    cantSGL?: IntFieldUpdateOperationsInput | number
    cantDBL?: IntFieldUpdateOperationsInput | number
    cantTPL?: IntFieldUpdateOperationsInput | number
    cantQUAD?: IntFieldUpdateOperationsInput | number
    cantCHD?: IntFieldUpdateOperationsInput | number
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioCHD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    subtotal?: FloatFieldUpdateOperationsInput | number
    markup?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    fechaViaje?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaRetorno?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    tokenAprobacion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaEnvio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaAprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type HistorialCotizacionCreateInput = {
    id?: string
    statusAnterior?: $Enums.CotizacionStatus | null
    statusNuevo: $Enums.CotizacionStatus
    nota?: string | null
    fecha?: Date | string
    cotizacion: CotizacionCreateNestedOneWithoutHistorialInput
    cambiadoPor: UsuarioAgenciaCreateNestedOneWithoutHistorialCambiosInput
  }

  export type HistorialCotizacionUncheckedCreateInput = {
    id?: string
    cotizacionId: string
    cambiadoPorId: string
    statusAnterior?: $Enums.CotizacionStatus | null
    statusNuevo: $Enums.CotizacionStatus
    nota?: string | null
    fecha?: Date | string
  }

  export type HistorialCotizacionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    statusAnterior?: NullableEnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus | null
    statusNuevo?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    nota?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    cotizacion?: CotizacionUpdateOneRequiredWithoutHistorialNestedInput
    cambiadoPor?: UsuarioAgenciaUpdateOneRequiredWithoutHistorialCambiosNestedInput
  }

  export type HistorialCotizacionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    cotizacionId?: StringFieldUpdateOperationsInput | string
    cambiadoPorId?: StringFieldUpdateOperationsInput | string
    statusAnterior?: NullableEnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus | null
    statusNuevo?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    nota?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HistorialCotizacionCreateManyInput = {
    id?: string
    cotizacionId: string
    cambiadoPorId: string
    statusAnterior?: $Enums.CotizacionStatus | null
    statusNuevo: $Enums.CotizacionStatus
    nota?: string | null
    fecha?: Date | string
  }

  export type HistorialCotizacionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    statusAnterior?: NullableEnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus | null
    statusNuevo?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    nota?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HistorialCotizacionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    cotizacionId?: StringFieldUpdateOperationsInput | string
    cambiadoPorId?: StringFieldUpdateOperationsInput | string
    statusAnterior?: NullableEnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus | null
    statusNuevo?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    nota?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type UsuarioAgenciaListRelationFilter = {
    every?: UsuarioAgenciaWhereInput
    some?: UsuarioAgenciaWhereInput
    none?: UsuarioAgenciaWhereInput
  }

  export type ClienteListRelationFilter = {
    every?: ClienteWhereInput
    some?: ClienteWhereInput
    none?: ClienteWhereInput
  }

  export type CotizacionListRelationFilter = {
    every?: CotizacionWhereInput
    some?: CotizacionWhereInput
    none?: CotizacionWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UsuarioAgenciaOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ClienteOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CotizacionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AgenciaCountOrderByAggregateInput = {
    id?: SortOrder
    nombre?: SortOrder
    correo?: SortOrder
    telefono?: SortOrder
  }

  export type AgenciaMaxOrderByAggregateInput = {
    id?: SortOrder
    nombre?: SortOrder
    correo?: SortOrder
    telefono?: SortOrder
  }

  export type AgenciaMinOrderByAggregateInput = {
    id?: SortOrder
    nombre?: SortOrder
    correo?: SortOrder
    telefono?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type AgenciaNullableScalarRelationFilter = {
    is?: AgenciaWhereInput | null
    isNot?: AgenciaWhereInput | null
  }

  export type HistorialCotizacionListRelationFilter = {
    every?: HistorialCotizacionWhereInput
    some?: HistorialCotizacionWhereInput
    none?: HistorialCotizacionWhereInput
  }

  export type HistorialCotizacionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UsuarioAgenciaCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    agenciaId?: SortOrder
  }

  export type UsuarioAgenciaMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    agenciaId?: SortOrder
  }

  export type UsuarioAgenciaMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    agenciaId?: SortOrder
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type PaqueteRefListRelationFilter = {
    every?: PaqueteRefWhereInput
    some?: PaqueteRefWhereInput
    none?: PaqueteRefWhereInput
  }

  export type PaqueteRefOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DestinoRefCountOrderByAggregateInput = {
    id?: SortOrder
    pais?: SortOrder
    ciudad?: SortOrder
    tagline?: SortOrder
    descripcion?: SortOrder
    imagen?: SortOrder
    color?: SortOrder
  }

  export type DestinoRefAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type DestinoRefMaxOrderByAggregateInput = {
    id?: SortOrder
    pais?: SortOrder
    ciudad?: SortOrder
    tagline?: SortOrder
    descripcion?: SortOrder
    imagen?: SortOrder
    color?: SortOrder
  }

  export type DestinoRefMinOrderByAggregateInput = {
    id?: SortOrder
    pais?: SortOrder
    ciudad?: SortOrder
    tagline?: SortOrder
    descripcion?: SortOrder
    imagen?: SortOrder
    color?: SortOrder
  }

  export type DestinoRefSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type DestinoRefNullableScalarRelationFilter = {
    is?: DestinoRefWhereInput | null
    isNot?: DestinoRefWhereInput | null
  }

  export type PaqueteRefCountOrderByAggregateInput = {
    id?: SortOrder
    nombre?: SortOrder
    descripcion?: SortOrder
    imagen?: SortOrder
    categoria?: SortOrder
    diasEstancia?: SortOrder
    nochesBase?: SortOrder
    incluyeBoleto?: SortOrder
    precioBoleto?: SortOrder
    precioSGL?: SortOrder
    precioDBL?: SortOrder
    precioTPL?: SortOrder
    precioQUAD?: SortOrder
    precioPorPersona?: SortOrder
    destinoId?: SortOrder
  }

  export type PaqueteRefAvgOrderByAggregateInput = {
    id?: SortOrder
    diasEstancia?: SortOrder
    nochesBase?: SortOrder
    precioBoleto?: SortOrder
    precioSGL?: SortOrder
    precioDBL?: SortOrder
    precioTPL?: SortOrder
    precioQUAD?: SortOrder
    precioPorPersona?: SortOrder
    destinoId?: SortOrder
  }

  export type PaqueteRefMaxOrderByAggregateInput = {
    id?: SortOrder
    nombre?: SortOrder
    descripcion?: SortOrder
    imagen?: SortOrder
    categoria?: SortOrder
    diasEstancia?: SortOrder
    nochesBase?: SortOrder
    incluyeBoleto?: SortOrder
    precioBoleto?: SortOrder
    precioSGL?: SortOrder
    precioDBL?: SortOrder
    precioTPL?: SortOrder
    precioQUAD?: SortOrder
    precioPorPersona?: SortOrder
    destinoId?: SortOrder
  }

  export type PaqueteRefMinOrderByAggregateInput = {
    id?: SortOrder
    nombre?: SortOrder
    descripcion?: SortOrder
    imagen?: SortOrder
    categoria?: SortOrder
    diasEstancia?: SortOrder
    nochesBase?: SortOrder
    incluyeBoleto?: SortOrder
    precioBoleto?: SortOrder
    precioSGL?: SortOrder
    precioDBL?: SortOrder
    precioTPL?: SortOrder
    precioQUAD?: SortOrder
    precioPorPersona?: SortOrder
    destinoId?: SortOrder
  }

  export type PaqueteRefSumOrderByAggregateInput = {
    id?: SortOrder
    diasEstancia?: SortOrder
    nochesBase?: SortOrder
    precioBoleto?: SortOrder
    precioSGL?: SortOrder
    precioDBL?: SortOrder
    precioTPL?: SortOrder
    precioQUAD?: SortOrder
    precioPorPersona?: SortOrder
    destinoId?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type AgenciaScalarRelationFilter = {
    is?: AgenciaWhereInput
    isNot?: AgenciaWhereInput
  }

  export type ClienteAgenciaIdEmailCompoundUniqueInput = {
    agenciaId: string
    email: string
  }

  export type ClienteAgenciaIdDocumentoCompoundUniqueInput = {
    agenciaId: string
    documento: string
  }

  export type ClienteCountOrderByAggregateInput = {
    id?: SortOrder
    agenciaId?: SortOrder
    nombre?: SortOrder
    email?: SortOrder
    telefono?: SortOrder
    documento?: SortOrder
    direccion?: SortOrder
    fechaAlta?: SortOrder
  }

  export type ClienteMaxOrderByAggregateInput = {
    id?: SortOrder
    agenciaId?: SortOrder
    nombre?: SortOrder
    email?: SortOrder
    telefono?: SortOrder
    documento?: SortOrder
    direccion?: SortOrder
    fechaAlta?: SortOrder
  }

  export type ClienteMinOrderByAggregateInput = {
    id?: SortOrder
    agenciaId?: SortOrder
    nombre?: SortOrder
    email?: SortOrder
    telefono?: SortOrder
    documento?: SortOrder
    direccion?: SortOrder
    fechaAlta?: SortOrder
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type EnumCotizacionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CotizacionStatus | EnumCotizacionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CotizacionStatus[] | ListEnumCotizacionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CotizacionStatus[] | ListEnumCotizacionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCotizacionStatusFilter<$PrismaModel> | $Enums.CotizacionStatus
  }

  export type UsuarioAgenciaScalarRelationFilter = {
    is?: UsuarioAgenciaWhereInput
    isNot?: UsuarioAgenciaWhereInput
  }

  export type PaqueteRefScalarRelationFilter = {
    is?: PaqueteRefWhereInput
    isNot?: PaqueteRefWhereInput
  }

  export type ClienteScalarRelationFilter = {
    is?: ClienteWhereInput
    isNot?: ClienteWhereInput
  }

  export type CotizacionCountOrderByAggregateInput = {
    id?: SortOrder
    codigo?: SortOrder
    agenciaId?: SortOrder
    creadoPorId?: SortOrder
    paqueteId?: SortOrder
    clienteId?: SortOrder
    paqueteNombre?: SortOrder
    paqueteDuracion?: SortOrder
    paqueteDestino?: SortOrder
    paqueteIncluye?: SortOrder
    incluyeBoleto?: SortOrder
    cantSGL?: SortOrder
    cantDBL?: SortOrder
    cantTPL?: SortOrder
    cantQUAD?: SortOrder
    cantCHD?: SortOrder
    precioSGL?: SortOrder
    precioDBL?: SortOrder
    precioTPL?: SortOrder
    precioQUAD?: SortOrder
    precioCHD?: SortOrder
    precioBoleto?: SortOrder
    subtotal?: SortOrder
    markup?: SortOrder
    total?: SortOrder
    fechaViaje?: SortOrder
    fechaRetorno?: SortOrder
    status?: SortOrder
    notas?: SortOrder
    tokenAprobacion?: SortOrder
    fechaCreacion?: SortOrder
    fechaEnvio?: SortOrder
    fechaAprobacion?: SortOrder
    fechaVencimiento?: SortOrder
  }

  export type CotizacionAvgOrderByAggregateInput = {
    paqueteId?: SortOrder
    cantSGL?: SortOrder
    cantDBL?: SortOrder
    cantTPL?: SortOrder
    cantQUAD?: SortOrder
    cantCHD?: SortOrder
    precioSGL?: SortOrder
    precioDBL?: SortOrder
    precioTPL?: SortOrder
    precioQUAD?: SortOrder
    precioCHD?: SortOrder
    precioBoleto?: SortOrder
    subtotal?: SortOrder
    markup?: SortOrder
    total?: SortOrder
  }

  export type CotizacionMaxOrderByAggregateInput = {
    id?: SortOrder
    codigo?: SortOrder
    agenciaId?: SortOrder
    creadoPorId?: SortOrder
    paqueteId?: SortOrder
    clienteId?: SortOrder
    paqueteNombre?: SortOrder
    paqueteDuracion?: SortOrder
    paqueteDestino?: SortOrder
    incluyeBoleto?: SortOrder
    cantSGL?: SortOrder
    cantDBL?: SortOrder
    cantTPL?: SortOrder
    cantQUAD?: SortOrder
    cantCHD?: SortOrder
    precioSGL?: SortOrder
    precioDBL?: SortOrder
    precioTPL?: SortOrder
    precioQUAD?: SortOrder
    precioCHD?: SortOrder
    precioBoleto?: SortOrder
    subtotal?: SortOrder
    markup?: SortOrder
    total?: SortOrder
    fechaViaje?: SortOrder
    fechaRetorno?: SortOrder
    status?: SortOrder
    notas?: SortOrder
    tokenAprobacion?: SortOrder
    fechaCreacion?: SortOrder
    fechaEnvio?: SortOrder
    fechaAprobacion?: SortOrder
    fechaVencimiento?: SortOrder
  }

  export type CotizacionMinOrderByAggregateInput = {
    id?: SortOrder
    codigo?: SortOrder
    agenciaId?: SortOrder
    creadoPorId?: SortOrder
    paqueteId?: SortOrder
    clienteId?: SortOrder
    paqueteNombre?: SortOrder
    paqueteDuracion?: SortOrder
    paqueteDestino?: SortOrder
    incluyeBoleto?: SortOrder
    cantSGL?: SortOrder
    cantDBL?: SortOrder
    cantTPL?: SortOrder
    cantQUAD?: SortOrder
    cantCHD?: SortOrder
    precioSGL?: SortOrder
    precioDBL?: SortOrder
    precioTPL?: SortOrder
    precioQUAD?: SortOrder
    precioCHD?: SortOrder
    precioBoleto?: SortOrder
    subtotal?: SortOrder
    markup?: SortOrder
    total?: SortOrder
    fechaViaje?: SortOrder
    fechaRetorno?: SortOrder
    status?: SortOrder
    notas?: SortOrder
    tokenAprobacion?: SortOrder
    fechaCreacion?: SortOrder
    fechaEnvio?: SortOrder
    fechaAprobacion?: SortOrder
    fechaVencimiento?: SortOrder
  }

  export type CotizacionSumOrderByAggregateInput = {
    paqueteId?: SortOrder
    cantSGL?: SortOrder
    cantDBL?: SortOrder
    cantTPL?: SortOrder
    cantQUAD?: SortOrder
    cantCHD?: SortOrder
    precioSGL?: SortOrder
    precioDBL?: SortOrder
    precioTPL?: SortOrder
    precioQUAD?: SortOrder
    precioCHD?: SortOrder
    precioBoleto?: SortOrder
    subtotal?: SortOrder
    markup?: SortOrder
    total?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumCotizacionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CotizacionStatus | EnumCotizacionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CotizacionStatus[] | ListEnumCotizacionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CotizacionStatus[] | ListEnumCotizacionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCotizacionStatusWithAggregatesFilter<$PrismaModel> | $Enums.CotizacionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCotizacionStatusFilter<$PrismaModel>
    _max?: NestedEnumCotizacionStatusFilter<$PrismaModel>
  }

  export type EnumCotizacionStatusNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.CotizacionStatus | EnumCotizacionStatusFieldRefInput<$PrismaModel> | null
    in?: $Enums.CotizacionStatus[] | ListEnumCotizacionStatusFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.CotizacionStatus[] | ListEnumCotizacionStatusFieldRefInput<$PrismaModel> | null
    not?: NestedEnumCotizacionStatusNullableFilter<$PrismaModel> | $Enums.CotizacionStatus | null
  }

  export type CotizacionScalarRelationFilter = {
    is?: CotizacionWhereInput
    isNot?: CotizacionWhereInput
  }

  export type HistorialCotizacionCountOrderByAggregateInput = {
    id?: SortOrder
    cotizacionId?: SortOrder
    cambiadoPorId?: SortOrder
    statusAnterior?: SortOrder
    statusNuevo?: SortOrder
    nota?: SortOrder
    fecha?: SortOrder
  }

  export type HistorialCotizacionMaxOrderByAggregateInput = {
    id?: SortOrder
    cotizacionId?: SortOrder
    cambiadoPorId?: SortOrder
    statusAnterior?: SortOrder
    statusNuevo?: SortOrder
    nota?: SortOrder
    fecha?: SortOrder
  }

  export type HistorialCotizacionMinOrderByAggregateInput = {
    id?: SortOrder
    cotizacionId?: SortOrder
    cambiadoPorId?: SortOrder
    statusAnterior?: SortOrder
    statusNuevo?: SortOrder
    nota?: SortOrder
    fecha?: SortOrder
  }

  export type EnumCotizacionStatusNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CotizacionStatus | EnumCotizacionStatusFieldRefInput<$PrismaModel> | null
    in?: $Enums.CotizacionStatus[] | ListEnumCotizacionStatusFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.CotizacionStatus[] | ListEnumCotizacionStatusFieldRefInput<$PrismaModel> | null
    not?: NestedEnumCotizacionStatusNullableWithAggregatesFilter<$PrismaModel> | $Enums.CotizacionStatus | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumCotizacionStatusNullableFilter<$PrismaModel>
    _max?: NestedEnumCotizacionStatusNullableFilter<$PrismaModel>
  }

  export type UsuarioAgenciaCreateNestedManyWithoutAgenciaInput = {
    create?: XOR<UsuarioAgenciaCreateWithoutAgenciaInput, UsuarioAgenciaUncheckedCreateWithoutAgenciaInput> | UsuarioAgenciaCreateWithoutAgenciaInput[] | UsuarioAgenciaUncheckedCreateWithoutAgenciaInput[]
    connectOrCreate?: UsuarioAgenciaCreateOrConnectWithoutAgenciaInput | UsuarioAgenciaCreateOrConnectWithoutAgenciaInput[]
    createMany?: UsuarioAgenciaCreateManyAgenciaInputEnvelope
    connect?: UsuarioAgenciaWhereUniqueInput | UsuarioAgenciaWhereUniqueInput[]
  }

  export type ClienteCreateNestedManyWithoutAgenciaInput = {
    create?: XOR<ClienteCreateWithoutAgenciaInput, ClienteUncheckedCreateWithoutAgenciaInput> | ClienteCreateWithoutAgenciaInput[] | ClienteUncheckedCreateWithoutAgenciaInput[]
    connectOrCreate?: ClienteCreateOrConnectWithoutAgenciaInput | ClienteCreateOrConnectWithoutAgenciaInput[]
    createMany?: ClienteCreateManyAgenciaInputEnvelope
    connect?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
  }

  export type CotizacionCreateNestedManyWithoutAgenciaInput = {
    create?: XOR<CotizacionCreateWithoutAgenciaInput, CotizacionUncheckedCreateWithoutAgenciaInput> | CotizacionCreateWithoutAgenciaInput[] | CotizacionUncheckedCreateWithoutAgenciaInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutAgenciaInput | CotizacionCreateOrConnectWithoutAgenciaInput[]
    createMany?: CotizacionCreateManyAgenciaInputEnvelope
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
  }

  export type UsuarioAgenciaUncheckedCreateNestedManyWithoutAgenciaInput = {
    create?: XOR<UsuarioAgenciaCreateWithoutAgenciaInput, UsuarioAgenciaUncheckedCreateWithoutAgenciaInput> | UsuarioAgenciaCreateWithoutAgenciaInput[] | UsuarioAgenciaUncheckedCreateWithoutAgenciaInput[]
    connectOrCreate?: UsuarioAgenciaCreateOrConnectWithoutAgenciaInput | UsuarioAgenciaCreateOrConnectWithoutAgenciaInput[]
    createMany?: UsuarioAgenciaCreateManyAgenciaInputEnvelope
    connect?: UsuarioAgenciaWhereUniqueInput | UsuarioAgenciaWhereUniqueInput[]
  }

  export type ClienteUncheckedCreateNestedManyWithoutAgenciaInput = {
    create?: XOR<ClienteCreateWithoutAgenciaInput, ClienteUncheckedCreateWithoutAgenciaInput> | ClienteCreateWithoutAgenciaInput[] | ClienteUncheckedCreateWithoutAgenciaInput[]
    connectOrCreate?: ClienteCreateOrConnectWithoutAgenciaInput | ClienteCreateOrConnectWithoutAgenciaInput[]
    createMany?: ClienteCreateManyAgenciaInputEnvelope
    connect?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
  }

  export type CotizacionUncheckedCreateNestedManyWithoutAgenciaInput = {
    create?: XOR<CotizacionCreateWithoutAgenciaInput, CotizacionUncheckedCreateWithoutAgenciaInput> | CotizacionCreateWithoutAgenciaInput[] | CotizacionUncheckedCreateWithoutAgenciaInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutAgenciaInput | CotizacionCreateOrConnectWithoutAgenciaInput[]
    createMany?: CotizacionCreateManyAgenciaInputEnvelope
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type UsuarioAgenciaUpdateManyWithoutAgenciaNestedInput = {
    create?: XOR<UsuarioAgenciaCreateWithoutAgenciaInput, UsuarioAgenciaUncheckedCreateWithoutAgenciaInput> | UsuarioAgenciaCreateWithoutAgenciaInput[] | UsuarioAgenciaUncheckedCreateWithoutAgenciaInput[]
    connectOrCreate?: UsuarioAgenciaCreateOrConnectWithoutAgenciaInput | UsuarioAgenciaCreateOrConnectWithoutAgenciaInput[]
    upsert?: UsuarioAgenciaUpsertWithWhereUniqueWithoutAgenciaInput | UsuarioAgenciaUpsertWithWhereUniqueWithoutAgenciaInput[]
    createMany?: UsuarioAgenciaCreateManyAgenciaInputEnvelope
    set?: UsuarioAgenciaWhereUniqueInput | UsuarioAgenciaWhereUniqueInput[]
    disconnect?: UsuarioAgenciaWhereUniqueInput | UsuarioAgenciaWhereUniqueInput[]
    delete?: UsuarioAgenciaWhereUniqueInput | UsuarioAgenciaWhereUniqueInput[]
    connect?: UsuarioAgenciaWhereUniqueInput | UsuarioAgenciaWhereUniqueInput[]
    update?: UsuarioAgenciaUpdateWithWhereUniqueWithoutAgenciaInput | UsuarioAgenciaUpdateWithWhereUniqueWithoutAgenciaInput[]
    updateMany?: UsuarioAgenciaUpdateManyWithWhereWithoutAgenciaInput | UsuarioAgenciaUpdateManyWithWhereWithoutAgenciaInput[]
    deleteMany?: UsuarioAgenciaScalarWhereInput | UsuarioAgenciaScalarWhereInput[]
  }

  export type ClienteUpdateManyWithoutAgenciaNestedInput = {
    create?: XOR<ClienteCreateWithoutAgenciaInput, ClienteUncheckedCreateWithoutAgenciaInput> | ClienteCreateWithoutAgenciaInput[] | ClienteUncheckedCreateWithoutAgenciaInput[]
    connectOrCreate?: ClienteCreateOrConnectWithoutAgenciaInput | ClienteCreateOrConnectWithoutAgenciaInput[]
    upsert?: ClienteUpsertWithWhereUniqueWithoutAgenciaInput | ClienteUpsertWithWhereUniqueWithoutAgenciaInput[]
    createMany?: ClienteCreateManyAgenciaInputEnvelope
    set?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
    disconnect?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
    delete?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
    connect?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
    update?: ClienteUpdateWithWhereUniqueWithoutAgenciaInput | ClienteUpdateWithWhereUniqueWithoutAgenciaInput[]
    updateMany?: ClienteUpdateManyWithWhereWithoutAgenciaInput | ClienteUpdateManyWithWhereWithoutAgenciaInput[]
    deleteMany?: ClienteScalarWhereInput | ClienteScalarWhereInput[]
  }

  export type CotizacionUpdateManyWithoutAgenciaNestedInput = {
    create?: XOR<CotizacionCreateWithoutAgenciaInput, CotizacionUncheckedCreateWithoutAgenciaInput> | CotizacionCreateWithoutAgenciaInput[] | CotizacionUncheckedCreateWithoutAgenciaInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutAgenciaInput | CotizacionCreateOrConnectWithoutAgenciaInput[]
    upsert?: CotizacionUpsertWithWhereUniqueWithoutAgenciaInput | CotizacionUpsertWithWhereUniqueWithoutAgenciaInput[]
    createMany?: CotizacionCreateManyAgenciaInputEnvelope
    set?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    disconnect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    delete?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    update?: CotizacionUpdateWithWhereUniqueWithoutAgenciaInput | CotizacionUpdateWithWhereUniqueWithoutAgenciaInput[]
    updateMany?: CotizacionUpdateManyWithWhereWithoutAgenciaInput | CotizacionUpdateManyWithWhereWithoutAgenciaInput[]
    deleteMany?: CotizacionScalarWhereInput | CotizacionScalarWhereInput[]
  }

  export type UsuarioAgenciaUncheckedUpdateManyWithoutAgenciaNestedInput = {
    create?: XOR<UsuarioAgenciaCreateWithoutAgenciaInput, UsuarioAgenciaUncheckedCreateWithoutAgenciaInput> | UsuarioAgenciaCreateWithoutAgenciaInput[] | UsuarioAgenciaUncheckedCreateWithoutAgenciaInput[]
    connectOrCreate?: UsuarioAgenciaCreateOrConnectWithoutAgenciaInput | UsuarioAgenciaCreateOrConnectWithoutAgenciaInput[]
    upsert?: UsuarioAgenciaUpsertWithWhereUniqueWithoutAgenciaInput | UsuarioAgenciaUpsertWithWhereUniqueWithoutAgenciaInput[]
    createMany?: UsuarioAgenciaCreateManyAgenciaInputEnvelope
    set?: UsuarioAgenciaWhereUniqueInput | UsuarioAgenciaWhereUniqueInput[]
    disconnect?: UsuarioAgenciaWhereUniqueInput | UsuarioAgenciaWhereUniqueInput[]
    delete?: UsuarioAgenciaWhereUniqueInput | UsuarioAgenciaWhereUniqueInput[]
    connect?: UsuarioAgenciaWhereUniqueInput | UsuarioAgenciaWhereUniqueInput[]
    update?: UsuarioAgenciaUpdateWithWhereUniqueWithoutAgenciaInput | UsuarioAgenciaUpdateWithWhereUniqueWithoutAgenciaInput[]
    updateMany?: UsuarioAgenciaUpdateManyWithWhereWithoutAgenciaInput | UsuarioAgenciaUpdateManyWithWhereWithoutAgenciaInput[]
    deleteMany?: UsuarioAgenciaScalarWhereInput | UsuarioAgenciaScalarWhereInput[]
  }

  export type ClienteUncheckedUpdateManyWithoutAgenciaNestedInput = {
    create?: XOR<ClienteCreateWithoutAgenciaInput, ClienteUncheckedCreateWithoutAgenciaInput> | ClienteCreateWithoutAgenciaInput[] | ClienteUncheckedCreateWithoutAgenciaInput[]
    connectOrCreate?: ClienteCreateOrConnectWithoutAgenciaInput | ClienteCreateOrConnectWithoutAgenciaInput[]
    upsert?: ClienteUpsertWithWhereUniqueWithoutAgenciaInput | ClienteUpsertWithWhereUniqueWithoutAgenciaInput[]
    createMany?: ClienteCreateManyAgenciaInputEnvelope
    set?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
    disconnect?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
    delete?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
    connect?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
    update?: ClienteUpdateWithWhereUniqueWithoutAgenciaInput | ClienteUpdateWithWhereUniqueWithoutAgenciaInput[]
    updateMany?: ClienteUpdateManyWithWhereWithoutAgenciaInput | ClienteUpdateManyWithWhereWithoutAgenciaInput[]
    deleteMany?: ClienteScalarWhereInput | ClienteScalarWhereInput[]
  }

  export type CotizacionUncheckedUpdateManyWithoutAgenciaNestedInput = {
    create?: XOR<CotizacionCreateWithoutAgenciaInput, CotizacionUncheckedCreateWithoutAgenciaInput> | CotizacionCreateWithoutAgenciaInput[] | CotizacionUncheckedCreateWithoutAgenciaInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutAgenciaInput | CotizacionCreateOrConnectWithoutAgenciaInput[]
    upsert?: CotizacionUpsertWithWhereUniqueWithoutAgenciaInput | CotizacionUpsertWithWhereUniqueWithoutAgenciaInput[]
    createMany?: CotizacionCreateManyAgenciaInputEnvelope
    set?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    disconnect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    delete?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    update?: CotizacionUpdateWithWhereUniqueWithoutAgenciaInput | CotizacionUpdateWithWhereUniqueWithoutAgenciaInput[]
    updateMany?: CotizacionUpdateManyWithWhereWithoutAgenciaInput | CotizacionUpdateManyWithWhereWithoutAgenciaInput[]
    deleteMany?: CotizacionScalarWhereInput | CotizacionScalarWhereInput[]
  }

  export type AgenciaCreateNestedOneWithoutUsuariosInput = {
    create?: XOR<AgenciaCreateWithoutUsuariosInput, AgenciaUncheckedCreateWithoutUsuariosInput>
    connectOrCreate?: AgenciaCreateOrConnectWithoutUsuariosInput
    connect?: AgenciaWhereUniqueInput
  }

  export type CotizacionCreateNestedManyWithoutCreadoPorInput = {
    create?: XOR<CotizacionCreateWithoutCreadoPorInput, CotizacionUncheckedCreateWithoutCreadoPorInput> | CotizacionCreateWithoutCreadoPorInput[] | CotizacionUncheckedCreateWithoutCreadoPorInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutCreadoPorInput | CotizacionCreateOrConnectWithoutCreadoPorInput[]
    createMany?: CotizacionCreateManyCreadoPorInputEnvelope
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
  }

  export type HistorialCotizacionCreateNestedManyWithoutCambiadoPorInput = {
    create?: XOR<HistorialCotizacionCreateWithoutCambiadoPorInput, HistorialCotizacionUncheckedCreateWithoutCambiadoPorInput> | HistorialCotizacionCreateWithoutCambiadoPorInput[] | HistorialCotizacionUncheckedCreateWithoutCambiadoPorInput[]
    connectOrCreate?: HistorialCotizacionCreateOrConnectWithoutCambiadoPorInput | HistorialCotizacionCreateOrConnectWithoutCambiadoPorInput[]
    createMany?: HistorialCotizacionCreateManyCambiadoPorInputEnvelope
    connect?: HistorialCotizacionWhereUniqueInput | HistorialCotizacionWhereUniqueInput[]
  }

  export type CotizacionUncheckedCreateNestedManyWithoutCreadoPorInput = {
    create?: XOR<CotizacionCreateWithoutCreadoPorInput, CotizacionUncheckedCreateWithoutCreadoPorInput> | CotizacionCreateWithoutCreadoPorInput[] | CotizacionUncheckedCreateWithoutCreadoPorInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutCreadoPorInput | CotizacionCreateOrConnectWithoutCreadoPorInput[]
    createMany?: CotizacionCreateManyCreadoPorInputEnvelope
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
  }

  export type HistorialCotizacionUncheckedCreateNestedManyWithoutCambiadoPorInput = {
    create?: XOR<HistorialCotizacionCreateWithoutCambiadoPorInput, HistorialCotizacionUncheckedCreateWithoutCambiadoPorInput> | HistorialCotizacionCreateWithoutCambiadoPorInput[] | HistorialCotizacionUncheckedCreateWithoutCambiadoPorInput[]
    connectOrCreate?: HistorialCotizacionCreateOrConnectWithoutCambiadoPorInput | HistorialCotizacionCreateOrConnectWithoutCambiadoPorInput[]
    createMany?: HistorialCotizacionCreateManyCambiadoPorInputEnvelope
    connect?: HistorialCotizacionWhereUniqueInput | HistorialCotizacionWhereUniqueInput[]
  }

  export type AgenciaUpdateOneWithoutUsuariosNestedInput = {
    create?: XOR<AgenciaCreateWithoutUsuariosInput, AgenciaUncheckedCreateWithoutUsuariosInput>
    connectOrCreate?: AgenciaCreateOrConnectWithoutUsuariosInput
    upsert?: AgenciaUpsertWithoutUsuariosInput
    disconnect?: AgenciaWhereInput | boolean
    delete?: AgenciaWhereInput | boolean
    connect?: AgenciaWhereUniqueInput
    update?: XOR<XOR<AgenciaUpdateToOneWithWhereWithoutUsuariosInput, AgenciaUpdateWithoutUsuariosInput>, AgenciaUncheckedUpdateWithoutUsuariosInput>
  }

  export type CotizacionUpdateManyWithoutCreadoPorNestedInput = {
    create?: XOR<CotizacionCreateWithoutCreadoPorInput, CotizacionUncheckedCreateWithoutCreadoPorInput> | CotizacionCreateWithoutCreadoPorInput[] | CotizacionUncheckedCreateWithoutCreadoPorInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutCreadoPorInput | CotizacionCreateOrConnectWithoutCreadoPorInput[]
    upsert?: CotizacionUpsertWithWhereUniqueWithoutCreadoPorInput | CotizacionUpsertWithWhereUniqueWithoutCreadoPorInput[]
    createMany?: CotizacionCreateManyCreadoPorInputEnvelope
    set?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    disconnect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    delete?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    update?: CotizacionUpdateWithWhereUniqueWithoutCreadoPorInput | CotizacionUpdateWithWhereUniqueWithoutCreadoPorInput[]
    updateMany?: CotizacionUpdateManyWithWhereWithoutCreadoPorInput | CotizacionUpdateManyWithWhereWithoutCreadoPorInput[]
    deleteMany?: CotizacionScalarWhereInput | CotizacionScalarWhereInput[]
  }

  export type HistorialCotizacionUpdateManyWithoutCambiadoPorNestedInput = {
    create?: XOR<HistorialCotizacionCreateWithoutCambiadoPorInput, HistorialCotizacionUncheckedCreateWithoutCambiadoPorInput> | HistorialCotizacionCreateWithoutCambiadoPorInput[] | HistorialCotizacionUncheckedCreateWithoutCambiadoPorInput[]
    connectOrCreate?: HistorialCotizacionCreateOrConnectWithoutCambiadoPorInput | HistorialCotizacionCreateOrConnectWithoutCambiadoPorInput[]
    upsert?: HistorialCotizacionUpsertWithWhereUniqueWithoutCambiadoPorInput | HistorialCotizacionUpsertWithWhereUniqueWithoutCambiadoPorInput[]
    createMany?: HistorialCotizacionCreateManyCambiadoPorInputEnvelope
    set?: HistorialCotizacionWhereUniqueInput | HistorialCotizacionWhereUniqueInput[]
    disconnect?: HistorialCotizacionWhereUniqueInput | HistorialCotizacionWhereUniqueInput[]
    delete?: HistorialCotizacionWhereUniqueInput | HistorialCotizacionWhereUniqueInput[]
    connect?: HistorialCotizacionWhereUniqueInput | HistorialCotizacionWhereUniqueInput[]
    update?: HistorialCotizacionUpdateWithWhereUniqueWithoutCambiadoPorInput | HistorialCotizacionUpdateWithWhereUniqueWithoutCambiadoPorInput[]
    updateMany?: HistorialCotizacionUpdateManyWithWhereWithoutCambiadoPorInput | HistorialCotizacionUpdateManyWithWhereWithoutCambiadoPorInput[]
    deleteMany?: HistorialCotizacionScalarWhereInput | HistorialCotizacionScalarWhereInput[]
  }

  export type CotizacionUncheckedUpdateManyWithoutCreadoPorNestedInput = {
    create?: XOR<CotizacionCreateWithoutCreadoPorInput, CotizacionUncheckedCreateWithoutCreadoPorInput> | CotizacionCreateWithoutCreadoPorInput[] | CotizacionUncheckedCreateWithoutCreadoPorInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutCreadoPorInput | CotizacionCreateOrConnectWithoutCreadoPorInput[]
    upsert?: CotizacionUpsertWithWhereUniqueWithoutCreadoPorInput | CotizacionUpsertWithWhereUniqueWithoutCreadoPorInput[]
    createMany?: CotizacionCreateManyCreadoPorInputEnvelope
    set?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    disconnect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    delete?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    update?: CotizacionUpdateWithWhereUniqueWithoutCreadoPorInput | CotizacionUpdateWithWhereUniqueWithoutCreadoPorInput[]
    updateMany?: CotizacionUpdateManyWithWhereWithoutCreadoPorInput | CotizacionUpdateManyWithWhereWithoutCreadoPorInput[]
    deleteMany?: CotizacionScalarWhereInput | CotizacionScalarWhereInput[]
  }

  export type HistorialCotizacionUncheckedUpdateManyWithoutCambiadoPorNestedInput = {
    create?: XOR<HistorialCotizacionCreateWithoutCambiadoPorInput, HistorialCotizacionUncheckedCreateWithoutCambiadoPorInput> | HistorialCotizacionCreateWithoutCambiadoPorInput[] | HistorialCotizacionUncheckedCreateWithoutCambiadoPorInput[]
    connectOrCreate?: HistorialCotizacionCreateOrConnectWithoutCambiadoPorInput | HistorialCotizacionCreateOrConnectWithoutCambiadoPorInput[]
    upsert?: HistorialCotizacionUpsertWithWhereUniqueWithoutCambiadoPorInput | HistorialCotizacionUpsertWithWhereUniqueWithoutCambiadoPorInput[]
    createMany?: HistorialCotizacionCreateManyCambiadoPorInputEnvelope
    set?: HistorialCotizacionWhereUniqueInput | HistorialCotizacionWhereUniqueInput[]
    disconnect?: HistorialCotizacionWhereUniqueInput | HistorialCotizacionWhereUniqueInput[]
    delete?: HistorialCotizacionWhereUniqueInput | HistorialCotizacionWhereUniqueInput[]
    connect?: HistorialCotizacionWhereUniqueInput | HistorialCotizacionWhereUniqueInput[]
    update?: HistorialCotizacionUpdateWithWhereUniqueWithoutCambiadoPorInput | HistorialCotizacionUpdateWithWhereUniqueWithoutCambiadoPorInput[]
    updateMany?: HistorialCotizacionUpdateManyWithWhereWithoutCambiadoPorInput | HistorialCotizacionUpdateManyWithWhereWithoutCambiadoPorInput[]
    deleteMany?: HistorialCotizacionScalarWhereInput | HistorialCotizacionScalarWhereInput[]
  }

  export type PaqueteRefCreateNestedManyWithoutDestinoInput = {
    create?: XOR<PaqueteRefCreateWithoutDestinoInput, PaqueteRefUncheckedCreateWithoutDestinoInput> | PaqueteRefCreateWithoutDestinoInput[] | PaqueteRefUncheckedCreateWithoutDestinoInput[]
    connectOrCreate?: PaqueteRefCreateOrConnectWithoutDestinoInput | PaqueteRefCreateOrConnectWithoutDestinoInput[]
    createMany?: PaqueteRefCreateManyDestinoInputEnvelope
    connect?: PaqueteRefWhereUniqueInput | PaqueteRefWhereUniqueInput[]
  }

  export type PaqueteRefUncheckedCreateNestedManyWithoutDestinoInput = {
    create?: XOR<PaqueteRefCreateWithoutDestinoInput, PaqueteRefUncheckedCreateWithoutDestinoInput> | PaqueteRefCreateWithoutDestinoInput[] | PaqueteRefUncheckedCreateWithoutDestinoInput[]
    connectOrCreate?: PaqueteRefCreateOrConnectWithoutDestinoInput | PaqueteRefCreateOrConnectWithoutDestinoInput[]
    createMany?: PaqueteRefCreateManyDestinoInputEnvelope
    connect?: PaqueteRefWhereUniqueInput | PaqueteRefWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type PaqueteRefUpdateManyWithoutDestinoNestedInput = {
    create?: XOR<PaqueteRefCreateWithoutDestinoInput, PaqueteRefUncheckedCreateWithoutDestinoInput> | PaqueteRefCreateWithoutDestinoInput[] | PaqueteRefUncheckedCreateWithoutDestinoInput[]
    connectOrCreate?: PaqueteRefCreateOrConnectWithoutDestinoInput | PaqueteRefCreateOrConnectWithoutDestinoInput[]
    upsert?: PaqueteRefUpsertWithWhereUniqueWithoutDestinoInput | PaqueteRefUpsertWithWhereUniqueWithoutDestinoInput[]
    createMany?: PaqueteRefCreateManyDestinoInputEnvelope
    set?: PaqueteRefWhereUniqueInput | PaqueteRefWhereUniqueInput[]
    disconnect?: PaqueteRefWhereUniqueInput | PaqueteRefWhereUniqueInput[]
    delete?: PaqueteRefWhereUniqueInput | PaqueteRefWhereUniqueInput[]
    connect?: PaqueteRefWhereUniqueInput | PaqueteRefWhereUniqueInput[]
    update?: PaqueteRefUpdateWithWhereUniqueWithoutDestinoInput | PaqueteRefUpdateWithWhereUniqueWithoutDestinoInput[]
    updateMany?: PaqueteRefUpdateManyWithWhereWithoutDestinoInput | PaqueteRefUpdateManyWithWhereWithoutDestinoInput[]
    deleteMany?: PaqueteRefScalarWhereInput | PaqueteRefScalarWhereInput[]
  }

  export type PaqueteRefUncheckedUpdateManyWithoutDestinoNestedInput = {
    create?: XOR<PaqueteRefCreateWithoutDestinoInput, PaqueteRefUncheckedCreateWithoutDestinoInput> | PaqueteRefCreateWithoutDestinoInput[] | PaqueteRefUncheckedCreateWithoutDestinoInput[]
    connectOrCreate?: PaqueteRefCreateOrConnectWithoutDestinoInput | PaqueteRefCreateOrConnectWithoutDestinoInput[]
    upsert?: PaqueteRefUpsertWithWhereUniqueWithoutDestinoInput | PaqueteRefUpsertWithWhereUniqueWithoutDestinoInput[]
    createMany?: PaqueteRefCreateManyDestinoInputEnvelope
    set?: PaqueteRefWhereUniqueInput | PaqueteRefWhereUniqueInput[]
    disconnect?: PaqueteRefWhereUniqueInput | PaqueteRefWhereUniqueInput[]
    delete?: PaqueteRefWhereUniqueInput | PaqueteRefWhereUniqueInput[]
    connect?: PaqueteRefWhereUniqueInput | PaqueteRefWhereUniqueInput[]
    update?: PaqueteRefUpdateWithWhereUniqueWithoutDestinoInput | PaqueteRefUpdateWithWhereUniqueWithoutDestinoInput[]
    updateMany?: PaqueteRefUpdateManyWithWhereWithoutDestinoInput | PaqueteRefUpdateManyWithWhereWithoutDestinoInput[]
    deleteMany?: PaqueteRefScalarWhereInput | PaqueteRefScalarWhereInput[]
  }

  export type DestinoRefCreateNestedOneWithoutPaquetesInput = {
    create?: XOR<DestinoRefCreateWithoutPaquetesInput, DestinoRefUncheckedCreateWithoutPaquetesInput>
    connectOrCreate?: DestinoRefCreateOrConnectWithoutPaquetesInput
    connect?: DestinoRefWhereUniqueInput
  }

  export type CotizacionCreateNestedManyWithoutPaqueteInput = {
    create?: XOR<CotizacionCreateWithoutPaqueteInput, CotizacionUncheckedCreateWithoutPaqueteInput> | CotizacionCreateWithoutPaqueteInput[] | CotizacionUncheckedCreateWithoutPaqueteInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutPaqueteInput | CotizacionCreateOrConnectWithoutPaqueteInput[]
    createMany?: CotizacionCreateManyPaqueteInputEnvelope
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
  }

  export type CotizacionUncheckedCreateNestedManyWithoutPaqueteInput = {
    create?: XOR<CotizacionCreateWithoutPaqueteInput, CotizacionUncheckedCreateWithoutPaqueteInput> | CotizacionCreateWithoutPaqueteInput[] | CotizacionUncheckedCreateWithoutPaqueteInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutPaqueteInput | CotizacionCreateOrConnectWithoutPaqueteInput[]
    createMany?: CotizacionCreateManyPaqueteInputEnvelope
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DestinoRefUpdateOneWithoutPaquetesNestedInput = {
    create?: XOR<DestinoRefCreateWithoutPaquetesInput, DestinoRefUncheckedCreateWithoutPaquetesInput>
    connectOrCreate?: DestinoRefCreateOrConnectWithoutPaquetesInput
    upsert?: DestinoRefUpsertWithoutPaquetesInput
    disconnect?: DestinoRefWhereInput | boolean
    delete?: DestinoRefWhereInput | boolean
    connect?: DestinoRefWhereUniqueInput
    update?: XOR<XOR<DestinoRefUpdateToOneWithWhereWithoutPaquetesInput, DestinoRefUpdateWithoutPaquetesInput>, DestinoRefUncheckedUpdateWithoutPaquetesInput>
  }

  export type CotizacionUpdateManyWithoutPaqueteNestedInput = {
    create?: XOR<CotizacionCreateWithoutPaqueteInput, CotizacionUncheckedCreateWithoutPaqueteInput> | CotizacionCreateWithoutPaqueteInput[] | CotizacionUncheckedCreateWithoutPaqueteInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutPaqueteInput | CotizacionCreateOrConnectWithoutPaqueteInput[]
    upsert?: CotizacionUpsertWithWhereUniqueWithoutPaqueteInput | CotizacionUpsertWithWhereUniqueWithoutPaqueteInput[]
    createMany?: CotizacionCreateManyPaqueteInputEnvelope
    set?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    disconnect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    delete?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    update?: CotizacionUpdateWithWhereUniqueWithoutPaqueteInput | CotizacionUpdateWithWhereUniqueWithoutPaqueteInput[]
    updateMany?: CotizacionUpdateManyWithWhereWithoutPaqueteInput | CotizacionUpdateManyWithWhereWithoutPaqueteInput[]
    deleteMany?: CotizacionScalarWhereInput | CotizacionScalarWhereInput[]
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type CotizacionUncheckedUpdateManyWithoutPaqueteNestedInput = {
    create?: XOR<CotizacionCreateWithoutPaqueteInput, CotizacionUncheckedCreateWithoutPaqueteInput> | CotizacionCreateWithoutPaqueteInput[] | CotizacionUncheckedCreateWithoutPaqueteInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutPaqueteInput | CotizacionCreateOrConnectWithoutPaqueteInput[]
    upsert?: CotizacionUpsertWithWhereUniqueWithoutPaqueteInput | CotizacionUpsertWithWhereUniqueWithoutPaqueteInput[]
    createMany?: CotizacionCreateManyPaqueteInputEnvelope
    set?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    disconnect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    delete?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    update?: CotizacionUpdateWithWhereUniqueWithoutPaqueteInput | CotizacionUpdateWithWhereUniqueWithoutPaqueteInput[]
    updateMany?: CotizacionUpdateManyWithWhereWithoutPaqueteInput | CotizacionUpdateManyWithWhereWithoutPaqueteInput[]
    deleteMany?: CotizacionScalarWhereInput | CotizacionScalarWhereInput[]
  }

  export type AgenciaCreateNestedOneWithoutClientesInput = {
    create?: XOR<AgenciaCreateWithoutClientesInput, AgenciaUncheckedCreateWithoutClientesInput>
    connectOrCreate?: AgenciaCreateOrConnectWithoutClientesInput
    connect?: AgenciaWhereUniqueInput
  }

  export type CotizacionCreateNestedManyWithoutClienteInput = {
    create?: XOR<CotizacionCreateWithoutClienteInput, CotizacionUncheckedCreateWithoutClienteInput> | CotizacionCreateWithoutClienteInput[] | CotizacionUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutClienteInput | CotizacionCreateOrConnectWithoutClienteInput[]
    createMany?: CotizacionCreateManyClienteInputEnvelope
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
  }

  export type CotizacionUncheckedCreateNestedManyWithoutClienteInput = {
    create?: XOR<CotizacionCreateWithoutClienteInput, CotizacionUncheckedCreateWithoutClienteInput> | CotizacionCreateWithoutClienteInput[] | CotizacionUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutClienteInput | CotizacionCreateOrConnectWithoutClienteInput[]
    createMany?: CotizacionCreateManyClienteInputEnvelope
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type AgenciaUpdateOneRequiredWithoutClientesNestedInput = {
    create?: XOR<AgenciaCreateWithoutClientesInput, AgenciaUncheckedCreateWithoutClientesInput>
    connectOrCreate?: AgenciaCreateOrConnectWithoutClientesInput
    upsert?: AgenciaUpsertWithoutClientesInput
    connect?: AgenciaWhereUniqueInput
    update?: XOR<XOR<AgenciaUpdateToOneWithWhereWithoutClientesInput, AgenciaUpdateWithoutClientesInput>, AgenciaUncheckedUpdateWithoutClientesInput>
  }

  export type CotizacionUpdateManyWithoutClienteNestedInput = {
    create?: XOR<CotizacionCreateWithoutClienteInput, CotizacionUncheckedCreateWithoutClienteInput> | CotizacionCreateWithoutClienteInput[] | CotizacionUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutClienteInput | CotizacionCreateOrConnectWithoutClienteInput[]
    upsert?: CotizacionUpsertWithWhereUniqueWithoutClienteInput | CotizacionUpsertWithWhereUniqueWithoutClienteInput[]
    createMany?: CotizacionCreateManyClienteInputEnvelope
    set?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    disconnect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    delete?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    update?: CotizacionUpdateWithWhereUniqueWithoutClienteInput | CotizacionUpdateWithWhereUniqueWithoutClienteInput[]
    updateMany?: CotizacionUpdateManyWithWhereWithoutClienteInput | CotizacionUpdateManyWithWhereWithoutClienteInput[]
    deleteMany?: CotizacionScalarWhereInput | CotizacionScalarWhereInput[]
  }

  export type CotizacionUncheckedUpdateManyWithoutClienteNestedInput = {
    create?: XOR<CotizacionCreateWithoutClienteInput, CotizacionUncheckedCreateWithoutClienteInput> | CotizacionCreateWithoutClienteInput[] | CotizacionUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutClienteInput | CotizacionCreateOrConnectWithoutClienteInput[]
    upsert?: CotizacionUpsertWithWhereUniqueWithoutClienteInput | CotizacionUpsertWithWhereUniqueWithoutClienteInput[]
    createMany?: CotizacionCreateManyClienteInputEnvelope
    set?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    disconnect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    delete?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    update?: CotizacionUpdateWithWhereUniqueWithoutClienteInput | CotizacionUpdateWithWhereUniqueWithoutClienteInput[]
    updateMany?: CotizacionUpdateManyWithWhereWithoutClienteInput | CotizacionUpdateManyWithWhereWithoutClienteInput[]
    deleteMany?: CotizacionScalarWhereInput | CotizacionScalarWhereInput[]
  }

  export type CotizacionCreatepaqueteIncluyeInput = {
    set: string[]
  }

  export type AgenciaCreateNestedOneWithoutCotizacionesInput = {
    create?: XOR<AgenciaCreateWithoutCotizacionesInput, AgenciaUncheckedCreateWithoutCotizacionesInput>
    connectOrCreate?: AgenciaCreateOrConnectWithoutCotizacionesInput
    connect?: AgenciaWhereUniqueInput
  }

  export type UsuarioAgenciaCreateNestedOneWithoutCotizacionesInput = {
    create?: XOR<UsuarioAgenciaCreateWithoutCotizacionesInput, UsuarioAgenciaUncheckedCreateWithoutCotizacionesInput>
    connectOrCreate?: UsuarioAgenciaCreateOrConnectWithoutCotizacionesInput
    connect?: UsuarioAgenciaWhereUniqueInput
  }

  export type PaqueteRefCreateNestedOneWithoutCotizacionesInput = {
    create?: XOR<PaqueteRefCreateWithoutCotizacionesInput, PaqueteRefUncheckedCreateWithoutCotizacionesInput>
    connectOrCreate?: PaqueteRefCreateOrConnectWithoutCotizacionesInput
    connect?: PaqueteRefWhereUniqueInput
  }

  export type ClienteCreateNestedOneWithoutCotizacionesInput = {
    create?: XOR<ClienteCreateWithoutCotizacionesInput, ClienteUncheckedCreateWithoutCotizacionesInput>
    connectOrCreate?: ClienteCreateOrConnectWithoutCotizacionesInput
    connect?: ClienteWhereUniqueInput
  }

  export type HistorialCotizacionCreateNestedManyWithoutCotizacionInput = {
    create?: XOR<HistorialCotizacionCreateWithoutCotizacionInput, HistorialCotizacionUncheckedCreateWithoutCotizacionInput> | HistorialCotizacionCreateWithoutCotizacionInput[] | HistorialCotizacionUncheckedCreateWithoutCotizacionInput[]
    connectOrCreate?: HistorialCotizacionCreateOrConnectWithoutCotizacionInput | HistorialCotizacionCreateOrConnectWithoutCotizacionInput[]
    createMany?: HistorialCotizacionCreateManyCotizacionInputEnvelope
    connect?: HistorialCotizacionWhereUniqueInput | HistorialCotizacionWhereUniqueInput[]
  }

  export type HistorialCotizacionUncheckedCreateNestedManyWithoutCotizacionInput = {
    create?: XOR<HistorialCotizacionCreateWithoutCotizacionInput, HistorialCotizacionUncheckedCreateWithoutCotizacionInput> | HistorialCotizacionCreateWithoutCotizacionInput[] | HistorialCotizacionUncheckedCreateWithoutCotizacionInput[]
    connectOrCreate?: HistorialCotizacionCreateOrConnectWithoutCotizacionInput | HistorialCotizacionCreateOrConnectWithoutCotizacionInput[]
    createMany?: HistorialCotizacionCreateManyCotizacionInputEnvelope
    connect?: HistorialCotizacionWhereUniqueInput | HistorialCotizacionWhereUniqueInput[]
  }

  export type CotizacionUpdatepaqueteIncluyeInput = {
    set?: string[]
    push?: string | string[]
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type EnumCotizacionStatusFieldUpdateOperationsInput = {
    set?: $Enums.CotizacionStatus
  }

  export type AgenciaUpdateOneRequiredWithoutCotizacionesNestedInput = {
    create?: XOR<AgenciaCreateWithoutCotizacionesInput, AgenciaUncheckedCreateWithoutCotizacionesInput>
    connectOrCreate?: AgenciaCreateOrConnectWithoutCotizacionesInput
    upsert?: AgenciaUpsertWithoutCotizacionesInput
    connect?: AgenciaWhereUniqueInput
    update?: XOR<XOR<AgenciaUpdateToOneWithWhereWithoutCotizacionesInput, AgenciaUpdateWithoutCotizacionesInput>, AgenciaUncheckedUpdateWithoutCotizacionesInput>
  }

  export type UsuarioAgenciaUpdateOneRequiredWithoutCotizacionesNestedInput = {
    create?: XOR<UsuarioAgenciaCreateWithoutCotizacionesInput, UsuarioAgenciaUncheckedCreateWithoutCotizacionesInput>
    connectOrCreate?: UsuarioAgenciaCreateOrConnectWithoutCotizacionesInput
    upsert?: UsuarioAgenciaUpsertWithoutCotizacionesInput
    connect?: UsuarioAgenciaWhereUniqueInput
    update?: XOR<XOR<UsuarioAgenciaUpdateToOneWithWhereWithoutCotizacionesInput, UsuarioAgenciaUpdateWithoutCotizacionesInput>, UsuarioAgenciaUncheckedUpdateWithoutCotizacionesInput>
  }

  export type PaqueteRefUpdateOneRequiredWithoutCotizacionesNestedInput = {
    create?: XOR<PaqueteRefCreateWithoutCotizacionesInput, PaqueteRefUncheckedCreateWithoutCotizacionesInput>
    connectOrCreate?: PaqueteRefCreateOrConnectWithoutCotizacionesInput
    upsert?: PaqueteRefUpsertWithoutCotizacionesInput
    connect?: PaqueteRefWhereUniqueInput
    update?: XOR<XOR<PaqueteRefUpdateToOneWithWhereWithoutCotizacionesInput, PaqueteRefUpdateWithoutCotizacionesInput>, PaqueteRefUncheckedUpdateWithoutCotizacionesInput>
  }

  export type ClienteUpdateOneRequiredWithoutCotizacionesNestedInput = {
    create?: XOR<ClienteCreateWithoutCotizacionesInput, ClienteUncheckedCreateWithoutCotizacionesInput>
    connectOrCreate?: ClienteCreateOrConnectWithoutCotizacionesInput
    upsert?: ClienteUpsertWithoutCotizacionesInput
    connect?: ClienteWhereUniqueInput
    update?: XOR<XOR<ClienteUpdateToOneWithWhereWithoutCotizacionesInput, ClienteUpdateWithoutCotizacionesInput>, ClienteUncheckedUpdateWithoutCotizacionesInput>
  }

  export type HistorialCotizacionUpdateManyWithoutCotizacionNestedInput = {
    create?: XOR<HistorialCotizacionCreateWithoutCotizacionInput, HistorialCotizacionUncheckedCreateWithoutCotizacionInput> | HistorialCotizacionCreateWithoutCotizacionInput[] | HistorialCotizacionUncheckedCreateWithoutCotizacionInput[]
    connectOrCreate?: HistorialCotizacionCreateOrConnectWithoutCotizacionInput | HistorialCotizacionCreateOrConnectWithoutCotizacionInput[]
    upsert?: HistorialCotizacionUpsertWithWhereUniqueWithoutCotizacionInput | HistorialCotizacionUpsertWithWhereUniqueWithoutCotizacionInput[]
    createMany?: HistorialCotizacionCreateManyCotizacionInputEnvelope
    set?: HistorialCotizacionWhereUniqueInput | HistorialCotizacionWhereUniqueInput[]
    disconnect?: HistorialCotizacionWhereUniqueInput | HistorialCotizacionWhereUniqueInput[]
    delete?: HistorialCotizacionWhereUniqueInput | HistorialCotizacionWhereUniqueInput[]
    connect?: HistorialCotizacionWhereUniqueInput | HistorialCotizacionWhereUniqueInput[]
    update?: HistorialCotizacionUpdateWithWhereUniqueWithoutCotizacionInput | HistorialCotizacionUpdateWithWhereUniqueWithoutCotizacionInput[]
    updateMany?: HistorialCotizacionUpdateManyWithWhereWithoutCotizacionInput | HistorialCotizacionUpdateManyWithWhereWithoutCotizacionInput[]
    deleteMany?: HistorialCotizacionScalarWhereInput | HistorialCotizacionScalarWhereInput[]
  }

  export type HistorialCotizacionUncheckedUpdateManyWithoutCotizacionNestedInput = {
    create?: XOR<HistorialCotizacionCreateWithoutCotizacionInput, HistorialCotizacionUncheckedCreateWithoutCotizacionInput> | HistorialCotizacionCreateWithoutCotizacionInput[] | HistorialCotizacionUncheckedCreateWithoutCotizacionInput[]
    connectOrCreate?: HistorialCotizacionCreateOrConnectWithoutCotizacionInput | HistorialCotizacionCreateOrConnectWithoutCotizacionInput[]
    upsert?: HistorialCotizacionUpsertWithWhereUniqueWithoutCotizacionInput | HistorialCotizacionUpsertWithWhereUniqueWithoutCotizacionInput[]
    createMany?: HistorialCotizacionCreateManyCotizacionInputEnvelope
    set?: HistorialCotizacionWhereUniqueInput | HistorialCotizacionWhereUniqueInput[]
    disconnect?: HistorialCotizacionWhereUniqueInput | HistorialCotizacionWhereUniqueInput[]
    delete?: HistorialCotizacionWhereUniqueInput | HistorialCotizacionWhereUniqueInput[]
    connect?: HistorialCotizacionWhereUniqueInput | HistorialCotizacionWhereUniqueInput[]
    update?: HistorialCotizacionUpdateWithWhereUniqueWithoutCotizacionInput | HistorialCotizacionUpdateWithWhereUniqueWithoutCotizacionInput[]
    updateMany?: HistorialCotizacionUpdateManyWithWhereWithoutCotizacionInput | HistorialCotizacionUpdateManyWithWhereWithoutCotizacionInput[]
    deleteMany?: HistorialCotizacionScalarWhereInput | HistorialCotizacionScalarWhereInput[]
  }

  export type CotizacionCreateNestedOneWithoutHistorialInput = {
    create?: XOR<CotizacionCreateWithoutHistorialInput, CotizacionUncheckedCreateWithoutHistorialInput>
    connectOrCreate?: CotizacionCreateOrConnectWithoutHistorialInput
    connect?: CotizacionWhereUniqueInput
  }

  export type UsuarioAgenciaCreateNestedOneWithoutHistorialCambiosInput = {
    create?: XOR<UsuarioAgenciaCreateWithoutHistorialCambiosInput, UsuarioAgenciaUncheckedCreateWithoutHistorialCambiosInput>
    connectOrCreate?: UsuarioAgenciaCreateOrConnectWithoutHistorialCambiosInput
    connect?: UsuarioAgenciaWhereUniqueInput
  }

  export type NullableEnumCotizacionStatusFieldUpdateOperationsInput = {
    set?: $Enums.CotizacionStatus | null
  }

  export type CotizacionUpdateOneRequiredWithoutHistorialNestedInput = {
    create?: XOR<CotizacionCreateWithoutHistorialInput, CotizacionUncheckedCreateWithoutHistorialInput>
    connectOrCreate?: CotizacionCreateOrConnectWithoutHistorialInput
    upsert?: CotizacionUpsertWithoutHistorialInput
    connect?: CotizacionWhereUniqueInput
    update?: XOR<XOR<CotizacionUpdateToOneWithWhereWithoutHistorialInput, CotizacionUpdateWithoutHistorialInput>, CotizacionUncheckedUpdateWithoutHistorialInput>
  }

  export type UsuarioAgenciaUpdateOneRequiredWithoutHistorialCambiosNestedInput = {
    create?: XOR<UsuarioAgenciaCreateWithoutHistorialCambiosInput, UsuarioAgenciaUncheckedCreateWithoutHistorialCambiosInput>
    connectOrCreate?: UsuarioAgenciaCreateOrConnectWithoutHistorialCambiosInput
    upsert?: UsuarioAgenciaUpsertWithoutHistorialCambiosInput
    connect?: UsuarioAgenciaWhereUniqueInput
    update?: XOR<XOR<UsuarioAgenciaUpdateToOneWithWhereWithoutHistorialCambiosInput, UsuarioAgenciaUpdateWithoutHistorialCambiosInput>, UsuarioAgenciaUncheckedUpdateWithoutHistorialCambiosInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumCotizacionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CotizacionStatus | EnumCotizacionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CotizacionStatus[] | ListEnumCotizacionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CotizacionStatus[] | ListEnumCotizacionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCotizacionStatusFilter<$PrismaModel> | $Enums.CotizacionStatus
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumCotizacionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CotizacionStatus | EnumCotizacionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CotizacionStatus[] | ListEnumCotizacionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CotizacionStatus[] | ListEnumCotizacionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCotizacionStatusWithAggregatesFilter<$PrismaModel> | $Enums.CotizacionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCotizacionStatusFilter<$PrismaModel>
    _max?: NestedEnumCotizacionStatusFilter<$PrismaModel>
  }

  export type NestedEnumCotizacionStatusNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.CotizacionStatus | EnumCotizacionStatusFieldRefInput<$PrismaModel> | null
    in?: $Enums.CotizacionStatus[] | ListEnumCotizacionStatusFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.CotizacionStatus[] | ListEnumCotizacionStatusFieldRefInput<$PrismaModel> | null
    not?: NestedEnumCotizacionStatusNullableFilter<$PrismaModel> | $Enums.CotizacionStatus | null
  }

  export type NestedEnumCotizacionStatusNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CotizacionStatus | EnumCotizacionStatusFieldRefInput<$PrismaModel> | null
    in?: $Enums.CotizacionStatus[] | ListEnumCotizacionStatusFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.CotizacionStatus[] | ListEnumCotizacionStatusFieldRefInput<$PrismaModel> | null
    not?: NestedEnumCotizacionStatusNullableWithAggregatesFilter<$PrismaModel> | $Enums.CotizacionStatus | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumCotizacionStatusNullableFilter<$PrismaModel>
    _max?: NestedEnumCotizacionStatusNullableFilter<$PrismaModel>
  }

  export type UsuarioAgenciaCreateWithoutAgenciaInput = {
    id: string
    name?: string | null
    email?: string | null
    password?: string | null
    role: string
    cotizaciones?: CotizacionCreateNestedManyWithoutCreadoPorInput
    historialCambios?: HistorialCotizacionCreateNestedManyWithoutCambiadoPorInput
  }

  export type UsuarioAgenciaUncheckedCreateWithoutAgenciaInput = {
    id: string
    name?: string | null
    email?: string | null
    password?: string | null
    role: string
    cotizaciones?: CotizacionUncheckedCreateNestedManyWithoutCreadoPorInput
    historialCambios?: HistorialCotizacionUncheckedCreateNestedManyWithoutCambiadoPorInput
  }

  export type UsuarioAgenciaCreateOrConnectWithoutAgenciaInput = {
    where: UsuarioAgenciaWhereUniqueInput
    create: XOR<UsuarioAgenciaCreateWithoutAgenciaInput, UsuarioAgenciaUncheckedCreateWithoutAgenciaInput>
  }

  export type UsuarioAgenciaCreateManyAgenciaInputEnvelope = {
    data: UsuarioAgenciaCreateManyAgenciaInput | UsuarioAgenciaCreateManyAgenciaInput[]
    skipDuplicates?: boolean
  }

  export type ClienteCreateWithoutAgenciaInput = {
    id?: string
    nombre: string
    email?: string | null
    telefono?: string | null
    documento?: string | null
    direccion?: string | null
    fechaAlta?: Date | string
    cotizaciones?: CotizacionCreateNestedManyWithoutClienteInput
  }

  export type ClienteUncheckedCreateWithoutAgenciaInput = {
    id?: string
    nombre: string
    email?: string | null
    telefono?: string | null
    documento?: string | null
    direccion?: string | null
    fechaAlta?: Date | string
    cotizaciones?: CotizacionUncheckedCreateNestedManyWithoutClienteInput
  }

  export type ClienteCreateOrConnectWithoutAgenciaInput = {
    where: ClienteWhereUniqueInput
    create: XOR<ClienteCreateWithoutAgenciaInput, ClienteUncheckedCreateWithoutAgenciaInput>
  }

  export type ClienteCreateManyAgenciaInputEnvelope = {
    data: ClienteCreateManyAgenciaInput | ClienteCreateManyAgenciaInput[]
    skipDuplicates?: boolean
  }

  export type CotizacionCreateWithoutAgenciaInput = {
    id?: string
    codigo: string
    paqueteNombre: string
    paqueteDuracion: string
    paqueteDestino: string
    paqueteIncluye?: CotizacionCreatepaqueteIncluyeInput | string[]
    incluyeBoleto?: boolean
    cantSGL?: number
    cantDBL?: number
    cantTPL?: number
    cantQUAD?: number
    cantCHD?: number
    precioSGL?: number | null
    precioDBL?: number | null
    precioTPL?: number | null
    precioQUAD?: number | null
    precioCHD?: number | null
    precioBoleto?: number | null
    subtotal: number
    markup?: number
    total: number
    fechaViaje?: Date | string | null
    fechaRetorno?: Date | string | null
    status?: $Enums.CotizacionStatus
    notas?: string | null
    tokenAprobacion?: string | null
    fechaCreacion?: Date | string
    fechaEnvio?: Date | string | null
    fechaAprobacion?: Date | string | null
    fechaVencimiento?: Date | string | null
    creadoPor: UsuarioAgenciaCreateNestedOneWithoutCotizacionesInput
    paquete: PaqueteRefCreateNestedOneWithoutCotizacionesInput
    cliente: ClienteCreateNestedOneWithoutCotizacionesInput
    historial?: HistorialCotizacionCreateNestedManyWithoutCotizacionInput
  }

  export type CotizacionUncheckedCreateWithoutAgenciaInput = {
    id?: string
    codigo: string
    creadoPorId: string
    paqueteId: number
    clienteId: string
    paqueteNombre: string
    paqueteDuracion: string
    paqueteDestino: string
    paqueteIncluye?: CotizacionCreatepaqueteIncluyeInput | string[]
    incluyeBoleto?: boolean
    cantSGL?: number
    cantDBL?: number
    cantTPL?: number
    cantQUAD?: number
    cantCHD?: number
    precioSGL?: number | null
    precioDBL?: number | null
    precioTPL?: number | null
    precioQUAD?: number | null
    precioCHD?: number | null
    precioBoleto?: number | null
    subtotal: number
    markup?: number
    total: number
    fechaViaje?: Date | string | null
    fechaRetorno?: Date | string | null
    status?: $Enums.CotizacionStatus
    notas?: string | null
    tokenAprobacion?: string | null
    fechaCreacion?: Date | string
    fechaEnvio?: Date | string | null
    fechaAprobacion?: Date | string | null
    fechaVencimiento?: Date | string | null
    historial?: HistorialCotizacionUncheckedCreateNestedManyWithoutCotizacionInput
  }

  export type CotizacionCreateOrConnectWithoutAgenciaInput = {
    where: CotizacionWhereUniqueInput
    create: XOR<CotizacionCreateWithoutAgenciaInput, CotizacionUncheckedCreateWithoutAgenciaInput>
  }

  export type CotizacionCreateManyAgenciaInputEnvelope = {
    data: CotizacionCreateManyAgenciaInput | CotizacionCreateManyAgenciaInput[]
    skipDuplicates?: boolean
  }

  export type UsuarioAgenciaUpsertWithWhereUniqueWithoutAgenciaInput = {
    where: UsuarioAgenciaWhereUniqueInput
    update: XOR<UsuarioAgenciaUpdateWithoutAgenciaInput, UsuarioAgenciaUncheckedUpdateWithoutAgenciaInput>
    create: XOR<UsuarioAgenciaCreateWithoutAgenciaInput, UsuarioAgenciaUncheckedCreateWithoutAgenciaInput>
  }

  export type UsuarioAgenciaUpdateWithWhereUniqueWithoutAgenciaInput = {
    where: UsuarioAgenciaWhereUniqueInput
    data: XOR<UsuarioAgenciaUpdateWithoutAgenciaInput, UsuarioAgenciaUncheckedUpdateWithoutAgenciaInput>
  }

  export type UsuarioAgenciaUpdateManyWithWhereWithoutAgenciaInput = {
    where: UsuarioAgenciaScalarWhereInput
    data: XOR<UsuarioAgenciaUpdateManyMutationInput, UsuarioAgenciaUncheckedUpdateManyWithoutAgenciaInput>
  }

  export type UsuarioAgenciaScalarWhereInput = {
    AND?: UsuarioAgenciaScalarWhereInput | UsuarioAgenciaScalarWhereInput[]
    OR?: UsuarioAgenciaScalarWhereInput[]
    NOT?: UsuarioAgenciaScalarWhereInput | UsuarioAgenciaScalarWhereInput[]
    id?: StringFilter<"UsuarioAgencia"> | string
    name?: StringNullableFilter<"UsuarioAgencia"> | string | null
    email?: StringNullableFilter<"UsuarioAgencia"> | string | null
    password?: StringNullableFilter<"UsuarioAgencia"> | string | null
    role?: StringFilter<"UsuarioAgencia"> | string
    agenciaId?: StringNullableFilter<"UsuarioAgencia"> | string | null
  }

  export type ClienteUpsertWithWhereUniqueWithoutAgenciaInput = {
    where: ClienteWhereUniqueInput
    update: XOR<ClienteUpdateWithoutAgenciaInput, ClienteUncheckedUpdateWithoutAgenciaInput>
    create: XOR<ClienteCreateWithoutAgenciaInput, ClienteUncheckedCreateWithoutAgenciaInput>
  }

  export type ClienteUpdateWithWhereUniqueWithoutAgenciaInput = {
    where: ClienteWhereUniqueInput
    data: XOR<ClienteUpdateWithoutAgenciaInput, ClienteUncheckedUpdateWithoutAgenciaInput>
  }

  export type ClienteUpdateManyWithWhereWithoutAgenciaInput = {
    where: ClienteScalarWhereInput
    data: XOR<ClienteUpdateManyMutationInput, ClienteUncheckedUpdateManyWithoutAgenciaInput>
  }

  export type ClienteScalarWhereInput = {
    AND?: ClienteScalarWhereInput | ClienteScalarWhereInput[]
    OR?: ClienteScalarWhereInput[]
    NOT?: ClienteScalarWhereInput | ClienteScalarWhereInput[]
    id?: StringFilter<"Cliente"> | string
    agenciaId?: StringFilter<"Cliente"> | string
    nombre?: StringFilter<"Cliente"> | string
    email?: StringNullableFilter<"Cliente"> | string | null
    telefono?: StringNullableFilter<"Cliente"> | string | null
    documento?: StringNullableFilter<"Cliente"> | string | null
    direccion?: StringNullableFilter<"Cliente"> | string | null
    fechaAlta?: DateTimeFilter<"Cliente"> | Date | string
  }

  export type CotizacionUpsertWithWhereUniqueWithoutAgenciaInput = {
    where: CotizacionWhereUniqueInput
    update: XOR<CotizacionUpdateWithoutAgenciaInput, CotizacionUncheckedUpdateWithoutAgenciaInput>
    create: XOR<CotizacionCreateWithoutAgenciaInput, CotizacionUncheckedCreateWithoutAgenciaInput>
  }

  export type CotizacionUpdateWithWhereUniqueWithoutAgenciaInput = {
    where: CotizacionWhereUniqueInput
    data: XOR<CotizacionUpdateWithoutAgenciaInput, CotizacionUncheckedUpdateWithoutAgenciaInput>
  }

  export type CotizacionUpdateManyWithWhereWithoutAgenciaInput = {
    where: CotizacionScalarWhereInput
    data: XOR<CotizacionUpdateManyMutationInput, CotizacionUncheckedUpdateManyWithoutAgenciaInput>
  }

  export type CotizacionScalarWhereInput = {
    AND?: CotizacionScalarWhereInput | CotizacionScalarWhereInput[]
    OR?: CotizacionScalarWhereInput[]
    NOT?: CotizacionScalarWhereInput | CotizacionScalarWhereInput[]
    id?: StringFilter<"Cotizacion"> | string
    codigo?: StringFilter<"Cotizacion"> | string
    agenciaId?: StringFilter<"Cotizacion"> | string
    creadoPorId?: StringFilter<"Cotizacion"> | string
    paqueteId?: IntFilter<"Cotizacion"> | number
    clienteId?: StringFilter<"Cotizacion"> | string
    paqueteNombre?: StringFilter<"Cotizacion"> | string
    paqueteDuracion?: StringFilter<"Cotizacion"> | string
    paqueteDestino?: StringFilter<"Cotizacion"> | string
    paqueteIncluye?: StringNullableListFilter<"Cotizacion">
    incluyeBoleto?: BoolFilter<"Cotizacion"> | boolean
    cantSGL?: IntFilter<"Cotizacion"> | number
    cantDBL?: IntFilter<"Cotizacion"> | number
    cantTPL?: IntFilter<"Cotizacion"> | number
    cantQUAD?: IntFilter<"Cotizacion"> | number
    cantCHD?: IntFilter<"Cotizacion"> | number
    precioSGL?: FloatNullableFilter<"Cotizacion"> | number | null
    precioDBL?: FloatNullableFilter<"Cotizacion"> | number | null
    precioTPL?: FloatNullableFilter<"Cotizacion"> | number | null
    precioQUAD?: FloatNullableFilter<"Cotizacion"> | number | null
    precioCHD?: FloatNullableFilter<"Cotizacion"> | number | null
    precioBoleto?: FloatNullableFilter<"Cotizacion"> | number | null
    subtotal?: FloatFilter<"Cotizacion"> | number
    markup?: FloatFilter<"Cotizacion"> | number
    total?: FloatFilter<"Cotizacion"> | number
    fechaViaje?: DateTimeNullableFilter<"Cotizacion"> | Date | string | null
    fechaRetorno?: DateTimeNullableFilter<"Cotizacion"> | Date | string | null
    status?: EnumCotizacionStatusFilter<"Cotizacion"> | $Enums.CotizacionStatus
    notas?: StringNullableFilter<"Cotizacion"> | string | null
    tokenAprobacion?: StringNullableFilter<"Cotizacion"> | string | null
    fechaCreacion?: DateTimeFilter<"Cotizacion"> | Date | string
    fechaEnvio?: DateTimeNullableFilter<"Cotizacion"> | Date | string | null
    fechaAprobacion?: DateTimeNullableFilter<"Cotizacion"> | Date | string | null
    fechaVencimiento?: DateTimeNullableFilter<"Cotizacion"> | Date | string | null
  }

  export type AgenciaCreateWithoutUsuariosInput = {
    id: string
    nombre: string
    correo?: string | null
    telefono?: string | null
    clientes?: ClienteCreateNestedManyWithoutAgenciaInput
    cotizaciones?: CotizacionCreateNestedManyWithoutAgenciaInput
  }

  export type AgenciaUncheckedCreateWithoutUsuariosInput = {
    id: string
    nombre: string
    correo?: string | null
    telefono?: string | null
    clientes?: ClienteUncheckedCreateNestedManyWithoutAgenciaInput
    cotizaciones?: CotizacionUncheckedCreateNestedManyWithoutAgenciaInput
  }

  export type AgenciaCreateOrConnectWithoutUsuariosInput = {
    where: AgenciaWhereUniqueInput
    create: XOR<AgenciaCreateWithoutUsuariosInput, AgenciaUncheckedCreateWithoutUsuariosInput>
  }

  export type CotizacionCreateWithoutCreadoPorInput = {
    id?: string
    codigo: string
    paqueteNombre: string
    paqueteDuracion: string
    paqueteDestino: string
    paqueteIncluye?: CotizacionCreatepaqueteIncluyeInput | string[]
    incluyeBoleto?: boolean
    cantSGL?: number
    cantDBL?: number
    cantTPL?: number
    cantQUAD?: number
    cantCHD?: number
    precioSGL?: number | null
    precioDBL?: number | null
    precioTPL?: number | null
    precioQUAD?: number | null
    precioCHD?: number | null
    precioBoleto?: number | null
    subtotal: number
    markup?: number
    total: number
    fechaViaje?: Date | string | null
    fechaRetorno?: Date | string | null
    status?: $Enums.CotizacionStatus
    notas?: string | null
    tokenAprobacion?: string | null
    fechaCreacion?: Date | string
    fechaEnvio?: Date | string | null
    fechaAprobacion?: Date | string | null
    fechaVencimiento?: Date | string | null
    agencia: AgenciaCreateNestedOneWithoutCotizacionesInput
    paquete: PaqueteRefCreateNestedOneWithoutCotizacionesInput
    cliente: ClienteCreateNestedOneWithoutCotizacionesInput
    historial?: HistorialCotizacionCreateNestedManyWithoutCotizacionInput
  }

  export type CotizacionUncheckedCreateWithoutCreadoPorInput = {
    id?: string
    codigo: string
    agenciaId: string
    paqueteId: number
    clienteId: string
    paqueteNombre: string
    paqueteDuracion: string
    paqueteDestino: string
    paqueteIncluye?: CotizacionCreatepaqueteIncluyeInput | string[]
    incluyeBoleto?: boolean
    cantSGL?: number
    cantDBL?: number
    cantTPL?: number
    cantQUAD?: number
    cantCHD?: number
    precioSGL?: number | null
    precioDBL?: number | null
    precioTPL?: number | null
    precioQUAD?: number | null
    precioCHD?: number | null
    precioBoleto?: number | null
    subtotal: number
    markup?: number
    total: number
    fechaViaje?: Date | string | null
    fechaRetorno?: Date | string | null
    status?: $Enums.CotizacionStatus
    notas?: string | null
    tokenAprobacion?: string | null
    fechaCreacion?: Date | string
    fechaEnvio?: Date | string | null
    fechaAprobacion?: Date | string | null
    fechaVencimiento?: Date | string | null
    historial?: HistorialCotizacionUncheckedCreateNestedManyWithoutCotizacionInput
  }

  export type CotizacionCreateOrConnectWithoutCreadoPorInput = {
    where: CotizacionWhereUniqueInput
    create: XOR<CotizacionCreateWithoutCreadoPorInput, CotizacionUncheckedCreateWithoutCreadoPorInput>
  }

  export type CotizacionCreateManyCreadoPorInputEnvelope = {
    data: CotizacionCreateManyCreadoPorInput | CotizacionCreateManyCreadoPorInput[]
    skipDuplicates?: boolean
  }

  export type HistorialCotizacionCreateWithoutCambiadoPorInput = {
    id?: string
    statusAnterior?: $Enums.CotizacionStatus | null
    statusNuevo: $Enums.CotizacionStatus
    nota?: string | null
    fecha?: Date | string
    cotizacion: CotizacionCreateNestedOneWithoutHistorialInput
  }

  export type HistorialCotizacionUncheckedCreateWithoutCambiadoPorInput = {
    id?: string
    cotizacionId: string
    statusAnterior?: $Enums.CotizacionStatus | null
    statusNuevo: $Enums.CotizacionStatus
    nota?: string | null
    fecha?: Date | string
  }

  export type HistorialCotizacionCreateOrConnectWithoutCambiadoPorInput = {
    where: HistorialCotizacionWhereUniqueInput
    create: XOR<HistorialCotizacionCreateWithoutCambiadoPorInput, HistorialCotizacionUncheckedCreateWithoutCambiadoPorInput>
  }

  export type HistorialCotizacionCreateManyCambiadoPorInputEnvelope = {
    data: HistorialCotizacionCreateManyCambiadoPorInput | HistorialCotizacionCreateManyCambiadoPorInput[]
    skipDuplicates?: boolean
  }

  export type AgenciaUpsertWithoutUsuariosInput = {
    update: XOR<AgenciaUpdateWithoutUsuariosInput, AgenciaUncheckedUpdateWithoutUsuariosInput>
    create: XOR<AgenciaCreateWithoutUsuariosInput, AgenciaUncheckedCreateWithoutUsuariosInput>
    where?: AgenciaWhereInput
  }

  export type AgenciaUpdateToOneWithWhereWithoutUsuariosInput = {
    where?: AgenciaWhereInput
    data: XOR<AgenciaUpdateWithoutUsuariosInput, AgenciaUncheckedUpdateWithoutUsuariosInput>
  }

  export type AgenciaUpdateWithoutUsuariosInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    correo?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    clientes?: ClienteUpdateManyWithoutAgenciaNestedInput
    cotizaciones?: CotizacionUpdateManyWithoutAgenciaNestedInput
  }

  export type AgenciaUncheckedUpdateWithoutUsuariosInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    correo?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    clientes?: ClienteUncheckedUpdateManyWithoutAgenciaNestedInput
    cotizaciones?: CotizacionUncheckedUpdateManyWithoutAgenciaNestedInput
  }

  export type CotizacionUpsertWithWhereUniqueWithoutCreadoPorInput = {
    where: CotizacionWhereUniqueInput
    update: XOR<CotizacionUpdateWithoutCreadoPorInput, CotizacionUncheckedUpdateWithoutCreadoPorInput>
    create: XOR<CotizacionCreateWithoutCreadoPorInput, CotizacionUncheckedCreateWithoutCreadoPorInput>
  }

  export type CotizacionUpdateWithWhereUniqueWithoutCreadoPorInput = {
    where: CotizacionWhereUniqueInput
    data: XOR<CotizacionUpdateWithoutCreadoPorInput, CotizacionUncheckedUpdateWithoutCreadoPorInput>
  }

  export type CotizacionUpdateManyWithWhereWithoutCreadoPorInput = {
    where: CotizacionScalarWhereInput
    data: XOR<CotizacionUpdateManyMutationInput, CotizacionUncheckedUpdateManyWithoutCreadoPorInput>
  }

  export type HistorialCotizacionUpsertWithWhereUniqueWithoutCambiadoPorInput = {
    where: HistorialCotizacionWhereUniqueInput
    update: XOR<HistorialCotizacionUpdateWithoutCambiadoPorInput, HistorialCotizacionUncheckedUpdateWithoutCambiadoPorInput>
    create: XOR<HistorialCotizacionCreateWithoutCambiadoPorInput, HistorialCotizacionUncheckedCreateWithoutCambiadoPorInput>
  }

  export type HistorialCotizacionUpdateWithWhereUniqueWithoutCambiadoPorInput = {
    where: HistorialCotizacionWhereUniqueInput
    data: XOR<HistorialCotizacionUpdateWithoutCambiadoPorInput, HistorialCotizacionUncheckedUpdateWithoutCambiadoPorInput>
  }

  export type HistorialCotizacionUpdateManyWithWhereWithoutCambiadoPorInput = {
    where: HistorialCotizacionScalarWhereInput
    data: XOR<HistorialCotizacionUpdateManyMutationInput, HistorialCotizacionUncheckedUpdateManyWithoutCambiadoPorInput>
  }

  export type HistorialCotizacionScalarWhereInput = {
    AND?: HistorialCotizacionScalarWhereInput | HistorialCotizacionScalarWhereInput[]
    OR?: HistorialCotizacionScalarWhereInput[]
    NOT?: HistorialCotizacionScalarWhereInput | HistorialCotizacionScalarWhereInput[]
    id?: StringFilter<"HistorialCotizacion"> | string
    cotizacionId?: StringFilter<"HistorialCotizacion"> | string
    cambiadoPorId?: StringFilter<"HistorialCotizacion"> | string
    statusAnterior?: EnumCotizacionStatusNullableFilter<"HistorialCotizacion"> | $Enums.CotizacionStatus | null
    statusNuevo?: EnumCotizacionStatusFilter<"HistorialCotizacion"> | $Enums.CotizacionStatus
    nota?: StringNullableFilter<"HistorialCotizacion"> | string | null
    fecha?: DateTimeFilter<"HistorialCotizacion"> | Date | string
  }

  export type PaqueteRefCreateWithoutDestinoInput = {
    id: number
    nombre: string
    descripcion?: string | null
    imagen?: string | null
    categoria?: string | null
    diasEstancia: number
    nochesBase: number
    incluyeBoleto: boolean
    precioBoleto?: number | null
    precioSGL?: number | null
    precioDBL?: number | null
    precioTPL?: number | null
    precioQUAD?: number | null
    precioPorPersona?: number | null
    cotizaciones?: CotizacionCreateNestedManyWithoutPaqueteInput
  }

  export type PaqueteRefUncheckedCreateWithoutDestinoInput = {
    id: number
    nombre: string
    descripcion?: string | null
    imagen?: string | null
    categoria?: string | null
    diasEstancia: number
    nochesBase: number
    incluyeBoleto: boolean
    precioBoleto?: number | null
    precioSGL?: number | null
    precioDBL?: number | null
    precioTPL?: number | null
    precioQUAD?: number | null
    precioPorPersona?: number | null
    cotizaciones?: CotizacionUncheckedCreateNestedManyWithoutPaqueteInput
  }

  export type PaqueteRefCreateOrConnectWithoutDestinoInput = {
    where: PaqueteRefWhereUniqueInput
    create: XOR<PaqueteRefCreateWithoutDestinoInput, PaqueteRefUncheckedCreateWithoutDestinoInput>
  }

  export type PaqueteRefCreateManyDestinoInputEnvelope = {
    data: PaqueteRefCreateManyDestinoInput | PaqueteRefCreateManyDestinoInput[]
    skipDuplicates?: boolean
  }

  export type PaqueteRefUpsertWithWhereUniqueWithoutDestinoInput = {
    where: PaqueteRefWhereUniqueInput
    update: XOR<PaqueteRefUpdateWithoutDestinoInput, PaqueteRefUncheckedUpdateWithoutDestinoInput>
    create: XOR<PaqueteRefCreateWithoutDestinoInput, PaqueteRefUncheckedCreateWithoutDestinoInput>
  }

  export type PaqueteRefUpdateWithWhereUniqueWithoutDestinoInput = {
    where: PaqueteRefWhereUniqueInput
    data: XOR<PaqueteRefUpdateWithoutDestinoInput, PaqueteRefUncheckedUpdateWithoutDestinoInput>
  }

  export type PaqueteRefUpdateManyWithWhereWithoutDestinoInput = {
    where: PaqueteRefScalarWhereInput
    data: XOR<PaqueteRefUpdateManyMutationInput, PaqueteRefUncheckedUpdateManyWithoutDestinoInput>
  }

  export type PaqueteRefScalarWhereInput = {
    AND?: PaqueteRefScalarWhereInput | PaqueteRefScalarWhereInput[]
    OR?: PaqueteRefScalarWhereInput[]
    NOT?: PaqueteRefScalarWhereInput | PaqueteRefScalarWhereInput[]
    id?: IntFilter<"PaqueteRef"> | number
    nombre?: StringFilter<"PaqueteRef"> | string
    descripcion?: StringNullableFilter<"PaqueteRef"> | string | null
    imagen?: StringNullableFilter<"PaqueteRef"> | string | null
    categoria?: StringNullableFilter<"PaqueteRef"> | string | null
    diasEstancia?: IntFilter<"PaqueteRef"> | number
    nochesBase?: IntFilter<"PaqueteRef"> | number
    incluyeBoleto?: BoolFilter<"PaqueteRef"> | boolean
    precioBoleto?: FloatNullableFilter<"PaqueteRef"> | number | null
    precioSGL?: FloatNullableFilter<"PaqueteRef"> | number | null
    precioDBL?: FloatNullableFilter<"PaqueteRef"> | number | null
    precioTPL?: FloatNullableFilter<"PaqueteRef"> | number | null
    precioQUAD?: FloatNullableFilter<"PaqueteRef"> | number | null
    precioPorPersona?: FloatNullableFilter<"PaqueteRef"> | number | null
    destinoId?: IntNullableFilter<"PaqueteRef"> | number | null
  }

  export type DestinoRefCreateWithoutPaquetesInput = {
    id: number
    pais: string
    ciudad: string
    tagline?: string | null
    descripcion?: string | null
    imagen?: string | null
    color?: string | null
  }

  export type DestinoRefUncheckedCreateWithoutPaquetesInput = {
    id: number
    pais: string
    ciudad: string
    tagline?: string | null
    descripcion?: string | null
    imagen?: string | null
    color?: string | null
  }

  export type DestinoRefCreateOrConnectWithoutPaquetesInput = {
    where: DestinoRefWhereUniqueInput
    create: XOR<DestinoRefCreateWithoutPaquetesInput, DestinoRefUncheckedCreateWithoutPaquetesInput>
  }

  export type CotizacionCreateWithoutPaqueteInput = {
    id?: string
    codigo: string
    paqueteNombre: string
    paqueteDuracion: string
    paqueteDestino: string
    paqueteIncluye?: CotizacionCreatepaqueteIncluyeInput | string[]
    incluyeBoleto?: boolean
    cantSGL?: number
    cantDBL?: number
    cantTPL?: number
    cantQUAD?: number
    cantCHD?: number
    precioSGL?: number | null
    precioDBL?: number | null
    precioTPL?: number | null
    precioQUAD?: number | null
    precioCHD?: number | null
    precioBoleto?: number | null
    subtotal: number
    markup?: number
    total: number
    fechaViaje?: Date | string | null
    fechaRetorno?: Date | string | null
    status?: $Enums.CotizacionStatus
    notas?: string | null
    tokenAprobacion?: string | null
    fechaCreacion?: Date | string
    fechaEnvio?: Date | string | null
    fechaAprobacion?: Date | string | null
    fechaVencimiento?: Date | string | null
    agencia: AgenciaCreateNestedOneWithoutCotizacionesInput
    creadoPor: UsuarioAgenciaCreateNestedOneWithoutCotizacionesInput
    cliente: ClienteCreateNestedOneWithoutCotizacionesInput
    historial?: HistorialCotizacionCreateNestedManyWithoutCotizacionInput
  }

  export type CotizacionUncheckedCreateWithoutPaqueteInput = {
    id?: string
    codigo: string
    agenciaId: string
    creadoPorId: string
    clienteId: string
    paqueteNombre: string
    paqueteDuracion: string
    paqueteDestino: string
    paqueteIncluye?: CotizacionCreatepaqueteIncluyeInput | string[]
    incluyeBoleto?: boolean
    cantSGL?: number
    cantDBL?: number
    cantTPL?: number
    cantQUAD?: number
    cantCHD?: number
    precioSGL?: number | null
    precioDBL?: number | null
    precioTPL?: number | null
    precioQUAD?: number | null
    precioCHD?: number | null
    precioBoleto?: number | null
    subtotal: number
    markup?: number
    total: number
    fechaViaje?: Date | string | null
    fechaRetorno?: Date | string | null
    status?: $Enums.CotizacionStatus
    notas?: string | null
    tokenAprobacion?: string | null
    fechaCreacion?: Date | string
    fechaEnvio?: Date | string | null
    fechaAprobacion?: Date | string | null
    fechaVencimiento?: Date | string | null
    historial?: HistorialCotizacionUncheckedCreateNestedManyWithoutCotizacionInput
  }

  export type CotizacionCreateOrConnectWithoutPaqueteInput = {
    where: CotizacionWhereUniqueInput
    create: XOR<CotizacionCreateWithoutPaqueteInput, CotizacionUncheckedCreateWithoutPaqueteInput>
  }

  export type CotizacionCreateManyPaqueteInputEnvelope = {
    data: CotizacionCreateManyPaqueteInput | CotizacionCreateManyPaqueteInput[]
    skipDuplicates?: boolean
  }

  export type DestinoRefUpsertWithoutPaquetesInput = {
    update: XOR<DestinoRefUpdateWithoutPaquetesInput, DestinoRefUncheckedUpdateWithoutPaquetesInput>
    create: XOR<DestinoRefCreateWithoutPaquetesInput, DestinoRefUncheckedCreateWithoutPaquetesInput>
    where?: DestinoRefWhereInput
  }

  export type DestinoRefUpdateToOneWithWhereWithoutPaquetesInput = {
    where?: DestinoRefWhereInput
    data: XOR<DestinoRefUpdateWithoutPaquetesInput, DestinoRefUncheckedUpdateWithoutPaquetesInput>
  }

  export type DestinoRefUpdateWithoutPaquetesInput = {
    id?: IntFieldUpdateOperationsInput | number
    pais?: StringFieldUpdateOperationsInput | string
    ciudad?: StringFieldUpdateOperationsInput | string
    tagline?: NullableStringFieldUpdateOperationsInput | string | null
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    imagen?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DestinoRefUncheckedUpdateWithoutPaquetesInput = {
    id?: IntFieldUpdateOperationsInput | number
    pais?: StringFieldUpdateOperationsInput | string
    ciudad?: StringFieldUpdateOperationsInput | string
    tagline?: NullableStringFieldUpdateOperationsInput | string | null
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    imagen?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type CotizacionUpsertWithWhereUniqueWithoutPaqueteInput = {
    where: CotizacionWhereUniqueInput
    update: XOR<CotizacionUpdateWithoutPaqueteInput, CotizacionUncheckedUpdateWithoutPaqueteInput>
    create: XOR<CotizacionCreateWithoutPaqueteInput, CotizacionUncheckedCreateWithoutPaqueteInput>
  }

  export type CotizacionUpdateWithWhereUniqueWithoutPaqueteInput = {
    where: CotizacionWhereUniqueInput
    data: XOR<CotizacionUpdateWithoutPaqueteInput, CotizacionUncheckedUpdateWithoutPaqueteInput>
  }

  export type CotizacionUpdateManyWithWhereWithoutPaqueteInput = {
    where: CotizacionScalarWhereInput
    data: XOR<CotizacionUpdateManyMutationInput, CotizacionUncheckedUpdateManyWithoutPaqueteInput>
  }

  export type AgenciaCreateWithoutClientesInput = {
    id: string
    nombre: string
    correo?: string | null
    telefono?: string | null
    usuarios?: UsuarioAgenciaCreateNestedManyWithoutAgenciaInput
    cotizaciones?: CotizacionCreateNestedManyWithoutAgenciaInput
  }

  export type AgenciaUncheckedCreateWithoutClientesInput = {
    id: string
    nombre: string
    correo?: string | null
    telefono?: string | null
    usuarios?: UsuarioAgenciaUncheckedCreateNestedManyWithoutAgenciaInput
    cotizaciones?: CotizacionUncheckedCreateNestedManyWithoutAgenciaInput
  }

  export type AgenciaCreateOrConnectWithoutClientesInput = {
    where: AgenciaWhereUniqueInput
    create: XOR<AgenciaCreateWithoutClientesInput, AgenciaUncheckedCreateWithoutClientesInput>
  }

  export type CotizacionCreateWithoutClienteInput = {
    id?: string
    codigo: string
    paqueteNombre: string
    paqueteDuracion: string
    paqueteDestino: string
    paqueteIncluye?: CotizacionCreatepaqueteIncluyeInput | string[]
    incluyeBoleto?: boolean
    cantSGL?: number
    cantDBL?: number
    cantTPL?: number
    cantQUAD?: number
    cantCHD?: number
    precioSGL?: number | null
    precioDBL?: number | null
    precioTPL?: number | null
    precioQUAD?: number | null
    precioCHD?: number | null
    precioBoleto?: number | null
    subtotal: number
    markup?: number
    total: number
    fechaViaje?: Date | string | null
    fechaRetorno?: Date | string | null
    status?: $Enums.CotizacionStatus
    notas?: string | null
    tokenAprobacion?: string | null
    fechaCreacion?: Date | string
    fechaEnvio?: Date | string | null
    fechaAprobacion?: Date | string | null
    fechaVencimiento?: Date | string | null
    agencia: AgenciaCreateNestedOneWithoutCotizacionesInput
    creadoPor: UsuarioAgenciaCreateNestedOneWithoutCotizacionesInput
    paquete: PaqueteRefCreateNestedOneWithoutCotizacionesInput
    historial?: HistorialCotizacionCreateNestedManyWithoutCotizacionInput
  }

  export type CotizacionUncheckedCreateWithoutClienteInput = {
    id?: string
    codigo: string
    agenciaId: string
    creadoPorId: string
    paqueteId: number
    paqueteNombre: string
    paqueteDuracion: string
    paqueteDestino: string
    paqueteIncluye?: CotizacionCreatepaqueteIncluyeInput | string[]
    incluyeBoleto?: boolean
    cantSGL?: number
    cantDBL?: number
    cantTPL?: number
    cantQUAD?: number
    cantCHD?: number
    precioSGL?: number | null
    precioDBL?: number | null
    precioTPL?: number | null
    precioQUAD?: number | null
    precioCHD?: number | null
    precioBoleto?: number | null
    subtotal: number
    markup?: number
    total: number
    fechaViaje?: Date | string | null
    fechaRetorno?: Date | string | null
    status?: $Enums.CotizacionStatus
    notas?: string | null
    tokenAprobacion?: string | null
    fechaCreacion?: Date | string
    fechaEnvio?: Date | string | null
    fechaAprobacion?: Date | string | null
    fechaVencimiento?: Date | string | null
    historial?: HistorialCotizacionUncheckedCreateNestedManyWithoutCotizacionInput
  }

  export type CotizacionCreateOrConnectWithoutClienteInput = {
    where: CotizacionWhereUniqueInput
    create: XOR<CotizacionCreateWithoutClienteInput, CotizacionUncheckedCreateWithoutClienteInput>
  }

  export type CotizacionCreateManyClienteInputEnvelope = {
    data: CotizacionCreateManyClienteInput | CotizacionCreateManyClienteInput[]
    skipDuplicates?: boolean
  }

  export type AgenciaUpsertWithoutClientesInput = {
    update: XOR<AgenciaUpdateWithoutClientesInput, AgenciaUncheckedUpdateWithoutClientesInput>
    create: XOR<AgenciaCreateWithoutClientesInput, AgenciaUncheckedCreateWithoutClientesInput>
    where?: AgenciaWhereInput
  }

  export type AgenciaUpdateToOneWithWhereWithoutClientesInput = {
    where?: AgenciaWhereInput
    data: XOR<AgenciaUpdateWithoutClientesInput, AgenciaUncheckedUpdateWithoutClientesInput>
  }

  export type AgenciaUpdateWithoutClientesInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    correo?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    usuarios?: UsuarioAgenciaUpdateManyWithoutAgenciaNestedInput
    cotizaciones?: CotizacionUpdateManyWithoutAgenciaNestedInput
  }

  export type AgenciaUncheckedUpdateWithoutClientesInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    correo?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    usuarios?: UsuarioAgenciaUncheckedUpdateManyWithoutAgenciaNestedInput
    cotizaciones?: CotizacionUncheckedUpdateManyWithoutAgenciaNestedInput
  }

  export type CotizacionUpsertWithWhereUniqueWithoutClienteInput = {
    where: CotizacionWhereUniqueInput
    update: XOR<CotizacionUpdateWithoutClienteInput, CotizacionUncheckedUpdateWithoutClienteInput>
    create: XOR<CotizacionCreateWithoutClienteInput, CotizacionUncheckedCreateWithoutClienteInput>
  }

  export type CotizacionUpdateWithWhereUniqueWithoutClienteInput = {
    where: CotizacionWhereUniqueInput
    data: XOR<CotizacionUpdateWithoutClienteInput, CotizacionUncheckedUpdateWithoutClienteInput>
  }

  export type CotizacionUpdateManyWithWhereWithoutClienteInput = {
    where: CotizacionScalarWhereInput
    data: XOR<CotizacionUpdateManyMutationInput, CotizacionUncheckedUpdateManyWithoutClienteInput>
  }

  export type AgenciaCreateWithoutCotizacionesInput = {
    id: string
    nombre: string
    correo?: string | null
    telefono?: string | null
    usuarios?: UsuarioAgenciaCreateNestedManyWithoutAgenciaInput
    clientes?: ClienteCreateNestedManyWithoutAgenciaInput
  }

  export type AgenciaUncheckedCreateWithoutCotizacionesInput = {
    id: string
    nombre: string
    correo?: string | null
    telefono?: string | null
    usuarios?: UsuarioAgenciaUncheckedCreateNestedManyWithoutAgenciaInput
    clientes?: ClienteUncheckedCreateNestedManyWithoutAgenciaInput
  }

  export type AgenciaCreateOrConnectWithoutCotizacionesInput = {
    where: AgenciaWhereUniqueInput
    create: XOR<AgenciaCreateWithoutCotizacionesInput, AgenciaUncheckedCreateWithoutCotizacionesInput>
  }

  export type UsuarioAgenciaCreateWithoutCotizacionesInput = {
    id: string
    name?: string | null
    email?: string | null
    password?: string | null
    role: string
    agencia?: AgenciaCreateNestedOneWithoutUsuariosInput
    historialCambios?: HistorialCotizacionCreateNestedManyWithoutCambiadoPorInput
  }

  export type UsuarioAgenciaUncheckedCreateWithoutCotizacionesInput = {
    id: string
    name?: string | null
    email?: string | null
    password?: string | null
    role: string
    agenciaId?: string | null
    historialCambios?: HistorialCotizacionUncheckedCreateNestedManyWithoutCambiadoPorInput
  }

  export type UsuarioAgenciaCreateOrConnectWithoutCotizacionesInput = {
    where: UsuarioAgenciaWhereUniqueInput
    create: XOR<UsuarioAgenciaCreateWithoutCotizacionesInput, UsuarioAgenciaUncheckedCreateWithoutCotizacionesInput>
  }

  export type PaqueteRefCreateWithoutCotizacionesInput = {
    id: number
    nombre: string
    descripcion?: string | null
    imagen?: string | null
    categoria?: string | null
    diasEstancia: number
    nochesBase: number
    incluyeBoleto: boolean
    precioBoleto?: number | null
    precioSGL?: number | null
    precioDBL?: number | null
    precioTPL?: number | null
    precioQUAD?: number | null
    precioPorPersona?: number | null
    destino?: DestinoRefCreateNestedOneWithoutPaquetesInput
  }

  export type PaqueteRefUncheckedCreateWithoutCotizacionesInput = {
    id: number
    nombre: string
    descripcion?: string | null
    imagen?: string | null
    categoria?: string | null
    diasEstancia: number
    nochesBase: number
    incluyeBoleto: boolean
    precioBoleto?: number | null
    precioSGL?: number | null
    precioDBL?: number | null
    precioTPL?: number | null
    precioQUAD?: number | null
    precioPorPersona?: number | null
    destinoId?: number | null
  }

  export type PaqueteRefCreateOrConnectWithoutCotizacionesInput = {
    where: PaqueteRefWhereUniqueInput
    create: XOR<PaqueteRefCreateWithoutCotizacionesInput, PaqueteRefUncheckedCreateWithoutCotizacionesInput>
  }

  export type ClienteCreateWithoutCotizacionesInput = {
    id?: string
    nombre: string
    email?: string | null
    telefono?: string | null
    documento?: string | null
    direccion?: string | null
    fechaAlta?: Date | string
    agencia: AgenciaCreateNestedOneWithoutClientesInput
  }

  export type ClienteUncheckedCreateWithoutCotizacionesInput = {
    id?: string
    agenciaId: string
    nombre: string
    email?: string | null
    telefono?: string | null
    documento?: string | null
    direccion?: string | null
    fechaAlta?: Date | string
  }

  export type ClienteCreateOrConnectWithoutCotizacionesInput = {
    where: ClienteWhereUniqueInput
    create: XOR<ClienteCreateWithoutCotizacionesInput, ClienteUncheckedCreateWithoutCotizacionesInput>
  }

  export type HistorialCotizacionCreateWithoutCotizacionInput = {
    id?: string
    statusAnterior?: $Enums.CotizacionStatus | null
    statusNuevo: $Enums.CotizacionStatus
    nota?: string | null
    fecha?: Date | string
    cambiadoPor: UsuarioAgenciaCreateNestedOneWithoutHistorialCambiosInput
  }

  export type HistorialCotizacionUncheckedCreateWithoutCotizacionInput = {
    id?: string
    cambiadoPorId: string
    statusAnterior?: $Enums.CotizacionStatus | null
    statusNuevo: $Enums.CotizacionStatus
    nota?: string | null
    fecha?: Date | string
  }

  export type HistorialCotizacionCreateOrConnectWithoutCotizacionInput = {
    where: HistorialCotizacionWhereUniqueInput
    create: XOR<HistorialCotizacionCreateWithoutCotizacionInput, HistorialCotizacionUncheckedCreateWithoutCotizacionInput>
  }

  export type HistorialCotizacionCreateManyCotizacionInputEnvelope = {
    data: HistorialCotizacionCreateManyCotizacionInput | HistorialCotizacionCreateManyCotizacionInput[]
    skipDuplicates?: boolean
  }

  export type AgenciaUpsertWithoutCotizacionesInput = {
    update: XOR<AgenciaUpdateWithoutCotizacionesInput, AgenciaUncheckedUpdateWithoutCotizacionesInput>
    create: XOR<AgenciaCreateWithoutCotizacionesInput, AgenciaUncheckedCreateWithoutCotizacionesInput>
    where?: AgenciaWhereInput
  }

  export type AgenciaUpdateToOneWithWhereWithoutCotizacionesInput = {
    where?: AgenciaWhereInput
    data: XOR<AgenciaUpdateWithoutCotizacionesInput, AgenciaUncheckedUpdateWithoutCotizacionesInput>
  }

  export type AgenciaUpdateWithoutCotizacionesInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    correo?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    usuarios?: UsuarioAgenciaUpdateManyWithoutAgenciaNestedInput
    clientes?: ClienteUpdateManyWithoutAgenciaNestedInput
  }

  export type AgenciaUncheckedUpdateWithoutCotizacionesInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    correo?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    usuarios?: UsuarioAgenciaUncheckedUpdateManyWithoutAgenciaNestedInput
    clientes?: ClienteUncheckedUpdateManyWithoutAgenciaNestedInput
  }

  export type UsuarioAgenciaUpsertWithoutCotizacionesInput = {
    update: XOR<UsuarioAgenciaUpdateWithoutCotizacionesInput, UsuarioAgenciaUncheckedUpdateWithoutCotizacionesInput>
    create: XOR<UsuarioAgenciaCreateWithoutCotizacionesInput, UsuarioAgenciaUncheckedCreateWithoutCotizacionesInput>
    where?: UsuarioAgenciaWhereInput
  }

  export type UsuarioAgenciaUpdateToOneWithWhereWithoutCotizacionesInput = {
    where?: UsuarioAgenciaWhereInput
    data: XOR<UsuarioAgenciaUpdateWithoutCotizacionesInput, UsuarioAgenciaUncheckedUpdateWithoutCotizacionesInput>
  }

  export type UsuarioAgenciaUpdateWithoutCotizacionesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    agencia?: AgenciaUpdateOneWithoutUsuariosNestedInput
    historialCambios?: HistorialCotizacionUpdateManyWithoutCambiadoPorNestedInput
  }

  export type UsuarioAgenciaUncheckedUpdateWithoutCotizacionesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    agenciaId?: NullableStringFieldUpdateOperationsInput | string | null
    historialCambios?: HistorialCotizacionUncheckedUpdateManyWithoutCambiadoPorNestedInput
  }

  export type PaqueteRefUpsertWithoutCotizacionesInput = {
    update: XOR<PaqueteRefUpdateWithoutCotizacionesInput, PaqueteRefUncheckedUpdateWithoutCotizacionesInput>
    create: XOR<PaqueteRefCreateWithoutCotizacionesInput, PaqueteRefUncheckedCreateWithoutCotizacionesInput>
    where?: PaqueteRefWhereInput
  }

  export type PaqueteRefUpdateToOneWithWhereWithoutCotizacionesInput = {
    where?: PaqueteRefWhereInput
    data: XOR<PaqueteRefUpdateWithoutCotizacionesInput, PaqueteRefUncheckedUpdateWithoutCotizacionesInput>
  }

  export type PaqueteRefUpdateWithoutCotizacionesInput = {
    id?: IntFieldUpdateOperationsInput | number
    nombre?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    imagen?: NullableStringFieldUpdateOperationsInput | string | null
    categoria?: NullableStringFieldUpdateOperationsInput | string | null
    diasEstancia?: IntFieldUpdateOperationsInput | number
    nochesBase?: IntFieldUpdateOperationsInput | number
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioPorPersona?: NullableFloatFieldUpdateOperationsInput | number | null
    destino?: DestinoRefUpdateOneWithoutPaquetesNestedInput
  }

  export type PaqueteRefUncheckedUpdateWithoutCotizacionesInput = {
    id?: IntFieldUpdateOperationsInput | number
    nombre?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    imagen?: NullableStringFieldUpdateOperationsInput | string | null
    categoria?: NullableStringFieldUpdateOperationsInput | string | null
    diasEstancia?: IntFieldUpdateOperationsInput | number
    nochesBase?: IntFieldUpdateOperationsInput | number
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioPorPersona?: NullableFloatFieldUpdateOperationsInput | number | null
    destinoId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type ClienteUpsertWithoutCotizacionesInput = {
    update: XOR<ClienteUpdateWithoutCotizacionesInput, ClienteUncheckedUpdateWithoutCotizacionesInput>
    create: XOR<ClienteCreateWithoutCotizacionesInput, ClienteUncheckedCreateWithoutCotizacionesInput>
    where?: ClienteWhereInput
  }

  export type ClienteUpdateToOneWithWhereWithoutCotizacionesInput = {
    where?: ClienteWhereInput
    data: XOR<ClienteUpdateWithoutCotizacionesInput, ClienteUncheckedUpdateWithoutCotizacionesInput>
  }

  export type ClienteUpdateWithoutCotizacionesInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    documento?: NullableStringFieldUpdateOperationsInput | string | null
    direccion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaAlta?: DateTimeFieldUpdateOperationsInput | Date | string
    agencia?: AgenciaUpdateOneRequiredWithoutClientesNestedInput
  }

  export type ClienteUncheckedUpdateWithoutCotizacionesInput = {
    id?: StringFieldUpdateOperationsInput | string
    agenciaId?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    documento?: NullableStringFieldUpdateOperationsInput | string | null
    direccion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaAlta?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HistorialCotizacionUpsertWithWhereUniqueWithoutCotizacionInput = {
    where: HistorialCotizacionWhereUniqueInput
    update: XOR<HistorialCotizacionUpdateWithoutCotizacionInput, HistorialCotizacionUncheckedUpdateWithoutCotizacionInput>
    create: XOR<HistorialCotizacionCreateWithoutCotizacionInput, HistorialCotizacionUncheckedCreateWithoutCotizacionInput>
  }

  export type HistorialCotizacionUpdateWithWhereUniqueWithoutCotizacionInput = {
    where: HistorialCotizacionWhereUniqueInput
    data: XOR<HistorialCotizacionUpdateWithoutCotizacionInput, HistorialCotizacionUncheckedUpdateWithoutCotizacionInput>
  }

  export type HistorialCotizacionUpdateManyWithWhereWithoutCotizacionInput = {
    where: HistorialCotizacionScalarWhereInput
    data: XOR<HistorialCotizacionUpdateManyMutationInput, HistorialCotizacionUncheckedUpdateManyWithoutCotizacionInput>
  }

  export type CotizacionCreateWithoutHistorialInput = {
    id?: string
    codigo: string
    paqueteNombre: string
    paqueteDuracion: string
    paqueteDestino: string
    paqueteIncluye?: CotizacionCreatepaqueteIncluyeInput | string[]
    incluyeBoleto?: boolean
    cantSGL?: number
    cantDBL?: number
    cantTPL?: number
    cantQUAD?: number
    cantCHD?: number
    precioSGL?: number | null
    precioDBL?: number | null
    precioTPL?: number | null
    precioQUAD?: number | null
    precioCHD?: number | null
    precioBoleto?: number | null
    subtotal: number
    markup?: number
    total: number
    fechaViaje?: Date | string | null
    fechaRetorno?: Date | string | null
    status?: $Enums.CotizacionStatus
    notas?: string | null
    tokenAprobacion?: string | null
    fechaCreacion?: Date | string
    fechaEnvio?: Date | string | null
    fechaAprobacion?: Date | string | null
    fechaVencimiento?: Date | string | null
    agencia: AgenciaCreateNestedOneWithoutCotizacionesInput
    creadoPor: UsuarioAgenciaCreateNestedOneWithoutCotizacionesInput
    paquete: PaqueteRefCreateNestedOneWithoutCotizacionesInput
    cliente: ClienteCreateNestedOneWithoutCotizacionesInput
  }

  export type CotizacionUncheckedCreateWithoutHistorialInput = {
    id?: string
    codigo: string
    agenciaId: string
    creadoPorId: string
    paqueteId: number
    clienteId: string
    paqueteNombre: string
    paqueteDuracion: string
    paqueteDestino: string
    paqueteIncluye?: CotizacionCreatepaqueteIncluyeInput | string[]
    incluyeBoleto?: boolean
    cantSGL?: number
    cantDBL?: number
    cantTPL?: number
    cantQUAD?: number
    cantCHD?: number
    precioSGL?: number | null
    precioDBL?: number | null
    precioTPL?: number | null
    precioQUAD?: number | null
    precioCHD?: number | null
    precioBoleto?: number | null
    subtotal: number
    markup?: number
    total: number
    fechaViaje?: Date | string | null
    fechaRetorno?: Date | string | null
    status?: $Enums.CotizacionStatus
    notas?: string | null
    tokenAprobacion?: string | null
    fechaCreacion?: Date | string
    fechaEnvio?: Date | string | null
    fechaAprobacion?: Date | string | null
    fechaVencimiento?: Date | string | null
  }

  export type CotizacionCreateOrConnectWithoutHistorialInput = {
    where: CotizacionWhereUniqueInput
    create: XOR<CotizacionCreateWithoutHistorialInput, CotizacionUncheckedCreateWithoutHistorialInput>
  }

  export type UsuarioAgenciaCreateWithoutHistorialCambiosInput = {
    id: string
    name?: string | null
    email?: string | null
    password?: string | null
    role: string
    agencia?: AgenciaCreateNestedOneWithoutUsuariosInput
    cotizaciones?: CotizacionCreateNestedManyWithoutCreadoPorInput
  }

  export type UsuarioAgenciaUncheckedCreateWithoutHistorialCambiosInput = {
    id: string
    name?: string | null
    email?: string | null
    password?: string | null
    role: string
    agenciaId?: string | null
    cotizaciones?: CotizacionUncheckedCreateNestedManyWithoutCreadoPorInput
  }

  export type UsuarioAgenciaCreateOrConnectWithoutHistorialCambiosInput = {
    where: UsuarioAgenciaWhereUniqueInput
    create: XOR<UsuarioAgenciaCreateWithoutHistorialCambiosInput, UsuarioAgenciaUncheckedCreateWithoutHistorialCambiosInput>
  }

  export type CotizacionUpsertWithoutHistorialInput = {
    update: XOR<CotizacionUpdateWithoutHistorialInput, CotizacionUncheckedUpdateWithoutHistorialInput>
    create: XOR<CotizacionCreateWithoutHistorialInput, CotizacionUncheckedCreateWithoutHistorialInput>
    where?: CotizacionWhereInput
  }

  export type CotizacionUpdateToOneWithWhereWithoutHistorialInput = {
    where?: CotizacionWhereInput
    data: XOR<CotizacionUpdateWithoutHistorialInput, CotizacionUncheckedUpdateWithoutHistorialInput>
  }

  export type CotizacionUpdateWithoutHistorialInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    paqueteNombre?: StringFieldUpdateOperationsInput | string
    paqueteDuracion?: StringFieldUpdateOperationsInput | string
    paqueteDestino?: StringFieldUpdateOperationsInput | string
    paqueteIncluye?: CotizacionUpdatepaqueteIncluyeInput | string[]
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    cantSGL?: IntFieldUpdateOperationsInput | number
    cantDBL?: IntFieldUpdateOperationsInput | number
    cantTPL?: IntFieldUpdateOperationsInput | number
    cantQUAD?: IntFieldUpdateOperationsInput | number
    cantCHD?: IntFieldUpdateOperationsInput | number
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioCHD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    subtotal?: FloatFieldUpdateOperationsInput | number
    markup?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    fechaViaje?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaRetorno?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    tokenAprobacion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaEnvio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaAprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    agencia?: AgenciaUpdateOneRequiredWithoutCotizacionesNestedInput
    creadoPor?: UsuarioAgenciaUpdateOneRequiredWithoutCotizacionesNestedInput
    paquete?: PaqueteRefUpdateOneRequiredWithoutCotizacionesNestedInput
    cliente?: ClienteUpdateOneRequiredWithoutCotizacionesNestedInput
  }

  export type CotizacionUncheckedUpdateWithoutHistorialInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    agenciaId?: StringFieldUpdateOperationsInput | string
    creadoPorId?: StringFieldUpdateOperationsInput | string
    paqueteId?: IntFieldUpdateOperationsInput | number
    clienteId?: StringFieldUpdateOperationsInput | string
    paqueteNombre?: StringFieldUpdateOperationsInput | string
    paqueteDuracion?: StringFieldUpdateOperationsInput | string
    paqueteDestino?: StringFieldUpdateOperationsInput | string
    paqueteIncluye?: CotizacionUpdatepaqueteIncluyeInput | string[]
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    cantSGL?: IntFieldUpdateOperationsInput | number
    cantDBL?: IntFieldUpdateOperationsInput | number
    cantTPL?: IntFieldUpdateOperationsInput | number
    cantQUAD?: IntFieldUpdateOperationsInput | number
    cantCHD?: IntFieldUpdateOperationsInput | number
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioCHD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    subtotal?: FloatFieldUpdateOperationsInput | number
    markup?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    fechaViaje?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaRetorno?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    tokenAprobacion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaEnvio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaAprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UsuarioAgenciaUpsertWithoutHistorialCambiosInput = {
    update: XOR<UsuarioAgenciaUpdateWithoutHistorialCambiosInput, UsuarioAgenciaUncheckedUpdateWithoutHistorialCambiosInput>
    create: XOR<UsuarioAgenciaCreateWithoutHistorialCambiosInput, UsuarioAgenciaUncheckedCreateWithoutHistorialCambiosInput>
    where?: UsuarioAgenciaWhereInput
  }

  export type UsuarioAgenciaUpdateToOneWithWhereWithoutHistorialCambiosInput = {
    where?: UsuarioAgenciaWhereInput
    data: XOR<UsuarioAgenciaUpdateWithoutHistorialCambiosInput, UsuarioAgenciaUncheckedUpdateWithoutHistorialCambiosInput>
  }

  export type UsuarioAgenciaUpdateWithoutHistorialCambiosInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    agencia?: AgenciaUpdateOneWithoutUsuariosNestedInput
    cotizaciones?: CotizacionUpdateManyWithoutCreadoPorNestedInput
  }

  export type UsuarioAgenciaUncheckedUpdateWithoutHistorialCambiosInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    agenciaId?: NullableStringFieldUpdateOperationsInput | string | null
    cotizaciones?: CotizacionUncheckedUpdateManyWithoutCreadoPorNestedInput
  }

  export type UsuarioAgenciaCreateManyAgenciaInput = {
    id: string
    name?: string | null
    email?: string | null
    password?: string | null
    role: string
  }

  export type ClienteCreateManyAgenciaInput = {
    id?: string
    nombre: string
    email?: string | null
    telefono?: string | null
    documento?: string | null
    direccion?: string | null
    fechaAlta?: Date | string
  }

  export type CotizacionCreateManyAgenciaInput = {
    id?: string
    codigo: string
    creadoPorId: string
    paqueteId: number
    clienteId: string
    paqueteNombre: string
    paqueteDuracion: string
    paqueteDestino: string
    paqueteIncluye?: CotizacionCreatepaqueteIncluyeInput | string[]
    incluyeBoleto?: boolean
    cantSGL?: number
    cantDBL?: number
    cantTPL?: number
    cantQUAD?: number
    cantCHD?: number
    precioSGL?: number | null
    precioDBL?: number | null
    precioTPL?: number | null
    precioQUAD?: number | null
    precioCHD?: number | null
    precioBoleto?: number | null
    subtotal: number
    markup?: number
    total: number
    fechaViaje?: Date | string | null
    fechaRetorno?: Date | string | null
    status?: $Enums.CotizacionStatus
    notas?: string | null
    tokenAprobacion?: string | null
    fechaCreacion?: Date | string
    fechaEnvio?: Date | string | null
    fechaAprobacion?: Date | string | null
    fechaVencimiento?: Date | string | null
  }

  export type UsuarioAgenciaUpdateWithoutAgenciaInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    cotizaciones?: CotizacionUpdateManyWithoutCreadoPorNestedInput
    historialCambios?: HistorialCotizacionUpdateManyWithoutCambiadoPorNestedInput
  }

  export type UsuarioAgenciaUncheckedUpdateWithoutAgenciaInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    cotizaciones?: CotizacionUncheckedUpdateManyWithoutCreadoPorNestedInput
    historialCambios?: HistorialCotizacionUncheckedUpdateManyWithoutCambiadoPorNestedInput
  }

  export type UsuarioAgenciaUncheckedUpdateManyWithoutAgenciaInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
  }

  export type ClienteUpdateWithoutAgenciaInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    documento?: NullableStringFieldUpdateOperationsInput | string | null
    direccion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaAlta?: DateTimeFieldUpdateOperationsInput | Date | string
    cotizaciones?: CotizacionUpdateManyWithoutClienteNestedInput
  }

  export type ClienteUncheckedUpdateWithoutAgenciaInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    documento?: NullableStringFieldUpdateOperationsInput | string | null
    direccion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaAlta?: DateTimeFieldUpdateOperationsInput | Date | string
    cotizaciones?: CotizacionUncheckedUpdateManyWithoutClienteNestedInput
  }

  export type ClienteUncheckedUpdateManyWithoutAgenciaInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    documento?: NullableStringFieldUpdateOperationsInput | string | null
    direccion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaAlta?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CotizacionUpdateWithoutAgenciaInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    paqueteNombre?: StringFieldUpdateOperationsInput | string
    paqueteDuracion?: StringFieldUpdateOperationsInput | string
    paqueteDestino?: StringFieldUpdateOperationsInput | string
    paqueteIncluye?: CotizacionUpdatepaqueteIncluyeInput | string[]
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    cantSGL?: IntFieldUpdateOperationsInput | number
    cantDBL?: IntFieldUpdateOperationsInput | number
    cantTPL?: IntFieldUpdateOperationsInput | number
    cantQUAD?: IntFieldUpdateOperationsInput | number
    cantCHD?: IntFieldUpdateOperationsInput | number
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioCHD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    subtotal?: FloatFieldUpdateOperationsInput | number
    markup?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    fechaViaje?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaRetorno?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    tokenAprobacion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaEnvio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaAprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    creadoPor?: UsuarioAgenciaUpdateOneRequiredWithoutCotizacionesNestedInput
    paquete?: PaqueteRefUpdateOneRequiredWithoutCotizacionesNestedInput
    cliente?: ClienteUpdateOneRequiredWithoutCotizacionesNestedInput
    historial?: HistorialCotizacionUpdateManyWithoutCotizacionNestedInput
  }

  export type CotizacionUncheckedUpdateWithoutAgenciaInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    creadoPorId?: StringFieldUpdateOperationsInput | string
    paqueteId?: IntFieldUpdateOperationsInput | number
    clienteId?: StringFieldUpdateOperationsInput | string
    paqueteNombre?: StringFieldUpdateOperationsInput | string
    paqueteDuracion?: StringFieldUpdateOperationsInput | string
    paqueteDestino?: StringFieldUpdateOperationsInput | string
    paqueteIncluye?: CotizacionUpdatepaqueteIncluyeInput | string[]
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    cantSGL?: IntFieldUpdateOperationsInput | number
    cantDBL?: IntFieldUpdateOperationsInput | number
    cantTPL?: IntFieldUpdateOperationsInput | number
    cantQUAD?: IntFieldUpdateOperationsInput | number
    cantCHD?: IntFieldUpdateOperationsInput | number
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioCHD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    subtotal?: FloatFieldUpdateOperationsInput | number
    markup?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    fechaViaje?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaRetorno?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    tokenAprobacion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaEnvio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaAprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    historial?: HistorialCotizacionUncheckedUpdateManyWithoutCotizacionNestedInput
  }

  export type CotizacionUncheckedUpdateManyWithoutAgenciaInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    creadoPorId?: StringFieldUpdateOperationsInput | string
    paqueteId?: IntFieldUpdateOperationsInput | number
    clienteId?: StringFieldUpdateOperationsInput | string
    paqueteNombre?: StringFieldUpdateOperationsInput | string
    paqueteDuracion?: StringFieldUpdateOperationsInput | string
    paqueteDestino?: StringFieldUpdateOperationsInput | string
    paqueteIncluye?: CotizacionUpdatepaqueteIncluyeInput | string[]
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    cantSGL?: IntFieldUpdateOperationsInput | number
    cantDBL?: IntFieldUpdateOperationsInput | number
    cantTPL?: IntFieldUpdateOperationsInput | number
    cantQUAD?: IntFieldUpdateOperationsInput | number
    cantCHD?: IntFieldUpdateOperationsInput | number
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioCHD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    subtotal?: FloatFieldUpdateOperationsInput | number
    markup?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    fechaViaje?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaRetorno?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    tokenAprobacion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaEnvio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaAprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CotizacionCreateManyCreadoPorInput = {
    id?: string
    codigo: string
    agenciaId: string
    paqueteId: number
    clienteId: string
    paqueteNombre: string
    paqueteDuracion: string
    paqueteDestino: string
    paqueteIncluye?: CotizacionCreatepaqueteIncluyeInput | string[]
    incluyeBoleto?: boolean
    cantSGL?: number
    cantDBL?: number
    cantTPL?: number
    cantQUAD?: number
    cantCHD?: number
    precioSGL?: number | null
    precioDBL?: number | null
    precioTPL?: number | null
    precioQUAD?: number | null
    precioCHD?: number | null
    precioBoleto?: number | null
    subtotal: number
    markup?: number
    total: number
    fechaViaje?: Date | string | null
    fechaRetorno?: Date | string | null
    status?: $Enums.CotizacionStatus
    notas?: string | null
    tokenAprobacion?: string | null
    fechaCreacion?: Date | string
    fechaEnvio?: Date | string | null
    fechaAprobacion?: Date | string | null
    fechaVencimiento?: Date | string | null
  }

  export type HistorialCotizacionCreateManyCambiadoPorInput = {
    id?: string
    cotizacionId: string
    statusAnterior?: $Enums.CotizacionStatus | null
    statusNuevo: $Enums.CotizacionStatus
    nota?: string | null
    fecha?: Date | string
  }

  export type CotizacionUpdateWithoutCreadoPorInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    paqueteNombre?: StringFieldUpdateOperationsInput | string
    paqueteDuracion?: StringFieldUpdateOperationsInput | string
    paqueteDestino?: StringFieldUpdateOperationsInput | string
    paqueteIncluye?: CotizacionUpdatepaqueteIncluyeInput | string[]
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    cantSGL?: IntFieldUpdateOperationsInput | number
    cantDBL?: IntFieldUpdateOperationsInput | number
    cantTPL?: IntFieldUpdateOperationsInput | number
    cantQUAD?: IntFieldUpdateOperationsInput | number
    cantCHD?: IntFieldUpdateOperationsInput | number
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioCHD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    subtotal?: FloatFieldUpdateOperationsInput | number
    markup?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    fechaViaje?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaRetorno?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    tokenAprobacion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaEnvio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaAprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    agencia?: AgenciaUpdateOneRequiredWithoutCotizacionesNestedInput
    paquete?: PaqueteRefUpdateOneRequiredWithoutCotizacionesNestedInput
    cliente?: ClienteUpdateOneRequiredWithoutCotizacionesNestedInput
    historial?: HistorialCotizacionUpdateManyWithoutCotizacionNestedInput
  }

  export type CotizacionUncheckedUpdateWithoutCreadoPorInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    agenciaId?: StringFieldUpdateOperationsInput | string
    paqueteId?: IntFieldUpdateOperationsInput | number
    clienteId?: StringFieldUpdateOperationsInput | string
    paqueteNombre?: StringFieldUpdateOperationsInput | string
    paqueteDuracion?: StringFieldUpdateOperationsInput | string
    paqueteDestino?: StringFieldUpdateOperationsInput | string
    paqueteIncluye?: CotizacionUpdatepaqueteIncluyeInput | string[]
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    cantSGL?: IntFieldUpdateOperationsInput | number
    cantDBL?: IntFieldUpdateOperationsInput | number
    cantTPL?: IntFieldUpdateOperationsInput | number
    cantQUAD?: IntFieldUpdateOperationsInput | number
    cantCHD?: IntFieldUpdateOperationsInput | number
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioCHD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    subtotal?: FloatFieldUpdateOperationsInput | number
    markup?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    fechaViaje?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaRetorno?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    tokenAprobacion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaEnvio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaAprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    historial?: HistorialCotizacionUncheckedUpdateManyWithoutCotizacionNestedInput
  }

  export type CotizacionUncheckedUpdateManyWithoutCreadoPorInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    agenciaId?: StringFieldUpdateOperationsInput | string
    paqueteId?: IntFieldUpdateOperationsInput | number
    clienteId?: StringFieldUpdateOperationsInput | string
    paqueteNombre?: StringFieldUpdateOperationsInput | string
    paqueteDuracion?: StringFieldUpdateOperationsInput | string
    paqueteDestino?: StringFieldUpdateOperationsInput | string
    paqueteIncluye?: CotizacionUpdatepaqueteIncluyeInput | string[]
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    cantSGL?: IntFieldUpdateOperationsInput | number
    cantDBL?: IntFieldUpdateOperationsInput | number
    cantTPL?: IntFieldUpdateOperationsInput | number
    cantQUAD?: IntFieldUpdateOperationsInput | number
    cantCHD?: IntFieldUpdateOperationsInput | number
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioCHD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    subtotal?: FloatFieldUpdateOperationsInput | number
    markup?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    fechaViaje?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaRetorno?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    tokenAprobacion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaEnvio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaAprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type HistorialCotizacionUpdateWithoutCambiadoPorInput = {
    id?: StringFieldUpdateOperationsInput | string
    statusAnterior?: NullableEnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus | null
    statusNuevo?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    nota?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    cotizacion?: CotizacionUpdateOneRequiredWithoutHistorialNestedInput
  }

  export type HistorialCotizacionUncheckedUpdateWithoutCambiadoPorInput = {
    id?: StringFieldUpdateOperationsInput | string
    cotizacionId?: StringFieldUpdateOperationsInput | string
    statusAnterior?: NullableEnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus | null
    statusNuevo?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    nota?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HistorialCotizacionUncheckedUpdateManyWithoutCambiadoPorInput = {
    id?: StringFieldUpdateOperationsInput | string
    cotizacionId?: StringFieldUpdateOperationsInput | string
    statusAnterior?: NullableEnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus | null
    statusNuevo?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    nota?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PaqueteRefCreateManyDestinoInput = {
    id: number
    nombre: string
    descripcion?: string | null
    imagen?: string | null
    categoria?: string | null
    diasEstancia: number
    nochesBase: number
    incluyeBoleto: boolean
    precioBoleto?: number | null
    precioSGL?: number | null
    precioDBL?: number | null
    precioTPL?: number | null
    precioQUAD?: number | null
    precioPorPersona?: number | null
  }

  export type PaqueteRefUpdateWithoutDestinoInput = {
    id?: IntFieldUpdateOperationsInput | number
    nombre?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    imagen?: NullableStringFieldUpdateOperationsInput | string | null
    categoria?: NullableStringFieldUpdateOperationsInput | string | null
    diasEstancia?: IntFieldUpdateOperationsInput | number
    nochesBase?: IntFieldUpdateOperationsInput | number
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioPorPersona?: NullableFloatFieldUpdateOperationsInput | number | null
    cotizaciones?: CotizacionUpdateManyWithoutPaqueteNestedInput
  }

  export type PaqueteRefUncheckedUpdateWithoutDestinoInput = {
    id?: IntFieldUpdateOperationsInput | number
    nombre?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    imagen?: NullableStringFieldUpdateOperationsInput | string | null
    categoria?: NullableStringFieldUpdateOperationsInput | string | null
    diasEstancia?: IntFieldUpdateOperationsInput | number
    nochesBase?: IntFieldUpdateOperationsInput | number
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioPorPersona?: NullableFloatFieldUpdateOperationsInput | number | null
    cotizaciones?: CotizacionUncheckedUpdateManyWithoutPaqueteNestedInput
  }

  export type PaqueteRefUncheckedUpdateManyWithoutDestinoInput = {
    id?: IntFieldUpdateOperationsInput | number
    nombre?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    imagen?: NullableStringFieldUpdateOperationsInput | string | null
    categoria?: NullableStringFieldUpdateOperationsInput | string | null
    diasEstancia?: IntFieldUpdateOperationsInput | number
    nochesBase?: IntFieldUpdateOperationsInput | number
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioPorPersona?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type CotizacionCreateManyPaqueteInput = {
    id?: string
    codigo: string
    agenciaId: string
    creadoPorId: string
    clienteId: string
    paqueteNombre: string
    paqueteDuracion: string
    paqueteDestino: string
    paqueteIncluye?: CotizacionCreatepaqueteIncluyeInput | string[]
    incluyeBoleto?: boolean
    cantSGL?: number
    cantDBL?: number
    cantTPL?: number
    cantQUAD?: number
    cantCHD?: number
    precioSGL?: number | null
    precioDBL?: number | null
    precioTPL?: number | null
    precioQUAD?: number | null
    precioCHD?: number | null
    precioBoleto?: number | null
    subtotal: number
    markup?: number
    total: number
    fechaViaje?: Date | string | null
    fechaRetorno?: Date | string | null
    status?: $Enums.CotizacionStatus
    notas?: string | null
    tokenAprobacion?: string | null
    fechaCreacion?: Date | string
    fechaEnvio?: Date | string | null
    fechaAprobacion?: Date | string | null
    fechaVencimiento?: Date | string | null
  }

  export type CotizacionUpdateWithoutPaqueteInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    paqueteNombre?: StringFieldUpdateOperationsInput | string
    paqueteDuracion?: StringFieldUpdateOperationsInput | string
    paqueteDestino?: StringFieldUpdateOperationsInput | string
    paqueteIncluye?: CotizacionUpdatepaqueteIncluyeInput | string[]
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    cantSGL?: IntFieldUpdateOperationsInput | number
    cantDBL?: IntFieldUpdateOperationsInput | number
    cantTPL?: IntFieldUpdateOperationsInput | number
    cantQUAD?: IntFieldUpdateOperationsInput | number
    cantCHD?: IntFieldUpdateOperationsInput | number
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioCHD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    subtotal?: FloatFieldUpdateOperationsInput | number
    markup?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    fechaViaje?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaRetorno?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    tokenAprobacion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaEnvio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaAprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    agencia?: AgenciaUpdateOneRequiredWithoutCotizacionesNestedInput
    creadoPor?: UsuarioAgenciaUpdateOneRequiredWithoutCotizacionesNestedInput
    cliente?: ClienteUpdateOneRequiredWithoutCotizacionesNestedInput
    historial?: HistorialCotizacionUpdateManyWithoutCotizacionNestedInput
  }

  export type CotizacionUncheckedUpdateWithoutPaqueteInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    agenciaId?: StringFieldUpdateOperationsInput | string
    creadoPorId?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    paqueteNombre?: StringFieldUpdateOperationsInput | string
    paqueteDuracion?: StringFieldUpdateOperationsInput | string
    paqueteDestino?: StringFieldUpdateOperationsInput | string
    paqueteIncluye?: CotizacionUpdatepaqueteIncluyeInput | string[]
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    cantSGL?: IntFieldUpdateOperationsInput | number
    cantDBL?: IntFieldUpdateOperationsInput | number
    cantTPL?: IntFieldUpdateOperationsInput | number
    cantQUAD?: IntFieldUpdateOperationsInput | number
    cantCHD?: IntFieldUpdateOperationsInput | number
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioCHD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    subtotal?: FloatFieldUpdateOperationsInput | number
    markup?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    fechaViaje?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaRetorno?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    tokenAprobacion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaEnvio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaAprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    historial?: HistorialCotizacionUncheckedUpdateManyWithoutCotizacionNestedInput
  }

  export type CotizacionUncheckedUpdateManyWithoutPaqueteInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    agenciaId?: StringFieldUpdateOperationsInput | string
    creadoPorId?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    paqueteNombre?: StringFieldUpdateOperationsInput | string
    paqueteDuracion?: StringFieldUpdateOperationsInput | string
    paqueteDestino?: StringFieldUpdateOperationsInput | string
    paqueteIncluye?: CotizacionUpdatepaqueteIncluyeInput | string[]
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    cantSGL?: IntFieldUpdateOperationsInput | number
    cantDBL?: IntFieldUpdateOperationsInput | number
    cantTPL?: IntFieldUpdateOperationsInput | number
    cantQUAD?: IntFieldUpdateOperationsInput | number
    cantCHD?: IntFieldUpdateOperationsInput | number
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioCHD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    subtotal?: FloatFieldUpdateOperationsInput | number
    markup?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    fechaViaje?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaRetorno?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    tokenAprobacion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaEnvio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaAprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CotizacionCreateManyClienteInput = {
    id?: string
    codigo: string
    agenciaId: string
    creadoPorId: string
    paqueteId: number
    paqueteNombre: string
    paqueteDuracion: string
    paqueteDestino: string
    paqueteIncluye?: CotizacionCreatepaqueteIncluyeInput | string[]
    incluyeBoleto?: boolean
    cantSGL?: number
    cantDBL?: number
    cantTPL?: number
    cantQUAD?: number
    cantCHD?: number
    precioSGL?: number | null
    precioDBL?: number | null
    precioTPL?: number | null
    precioQUAD?: number | null
    precioCHD?: number | null
    precioBoleto?: number | null
    subtotal: number
    markup?: number
    total: number
    fechaViaje?: Date | string | null
    fechaRetorno?: Date | string | null
    status?: $Enums.CotizacionStatus
    notas?: string | null
    tokenAprobacion?: string | null
    fechaCreacion?: Date | string
    fechaEnvio?: Date | string | null
    fechaAprobacion?: Date | string | null
    fechaVencimiento?: Date | string | null
  }

  export type CotizacionUpdateWithoutClienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    paqueteNombre?: StringFieldUpdateOperationsInput | string
    paqueteDuracion?: StringFieldUpdateOperationsInput | string
    paqueteDestino?: StringFieldUpdateOperationsInput | string
    paqueteIncluye?: CotizacionUpdatepaqueteIncluyeInput | string[]
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    cantSGL?: IntFieldUpdateOperationsInput | number
    cantDBL?: IntFieldUpdateOperationsInput | number
    cantTPL?: IntFieldUpdateOperationsInput | number
    cantQUAD?: IntFieldUpdateOperationsInput | number
    cantCHD?: IntFieldUpdateOperationsInput | number
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioCHD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    subtotal?: FloatFieldUpdateOperationsInput | number
    markup?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    fechaViaje?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaRetorno?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    tokenAprobacion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaEnvio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaAprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    agencia?: AgenciaUpdateOneRequiredWithoutCotizacionesNestedInput
    creadoPor?: UsuarioAgenciaUpdateOneRequiredWithoutCotizacionesNestedInput
    paquete?: PaqueteRefUpdateOneRequiredWithoutCotizacionesNestedInput
    historial?: HistorialCotizacionUpdateManyWithoutCotizacionNestedInput
  }

  export type CotizacionUncheckedUpdateWithoutClienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    agenciaId?: StringFieldUpdateOperationsInput | string
    creadoPorId?: StringFieldUpdateOperationsInput | string
    paqueteId?: IntFieldUpdateOperationsInput | number
    paqueteNombre?: StringFieldUpdateOperationsInput | string
    paqueteDuracion?: StringFieldUpdateOperationsInput | string
    paqueteDestino?: StringFieldUpdateOperationsInput | string
    paqueteIncluye?: CotizacionUpdatepaqueteIncluyeInput | string[]
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    cantSGL?: IntFieldUpdateOperationsInput | number
    cantDBL?: IntFieldUpdateOperationsInput | number
    cantTPL?: IntFieldUpdateOperationsInput | number
    cantQUAD?: IntFieldUpdateOperationsInput | number
    cantCHD?: IntFieldUpdateOperationsInput | number
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioCHD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    subtotal?: FloatFieldUpdateOperationsInput | number
    markup?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    fechaViaje?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaRetorno?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    tokenAprobacion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaEnvio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaAprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    historial?: HistorialCotizacionUncheckedUpdateManyWithoutCotizacionNestedInput
  }

  export type CotizacionUncheckedUpdateManyWithoutClienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    agenciaId?: StringFieldUpdateOperationsInput | string
    creadoPorId?: StringFieldUpdateOperationsInput | string
    paqueteId?: IntFieldUpdateOperationsInput | number
    paqueteNombre?: StringFieldUpdateOperationsInput | string
    paqueteDuracion?: StringFieldUpdateOperationsInput | string
    paqueteDestino?: StringFieldUpdateOperationsInput | string
    paqueteIncluye?: CotizacionUpdatepaqueteIncluyeInput | string[]
    incluyeBoleto?: BoolFieldUpdateOperationsInput | boolean
    cantSGL?: IntFieldUpdateOperationsInput | number
    cantDBL?: IntFieldUpdateOperationsInput | number
    cantTPL?: IntFieldUpdateOperationsInput | number
    cantQUAD?: IntFieldUpdateOperationsInput | number
    cantCHD?: IntFieldUpdateOperationsInput | number
    precioSGL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioDBL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioTPL?: NullableFloatFieldUpdateOperationsInput | number | null
    precioQUAD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioCHD?: NullableFloatFieldUpdateOperationsInput | number | null
    precioBoleto?: NullableFloatFieldUpdateOperationsInput | number | null
    subtotal?: FloatFieldUpdateOperationsInput | number
    markup?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    fechaViaje?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaRetorno?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    status?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    tokenAprobacion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaEnvio?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaAprobacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type HistorialCotizacionCreateManyCotizacionInput = {
    id?: string
    cambiadoPorId: string
    statusAnterior?: $Enums.CotizacionStatus | null
    statusNuevo: $Enums.CotizacionStatus
    nota?: string | null
    fecha?: Date | string
  }

  export type HistorialCotizacionUpdateWithoutCotizacionInput = {
    id?: StringFieldUpdateOperationsInput | string
    statusAnterior?: NullableEnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus | null
    statusNuevo?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    nota?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    cambiadoPor?: UsuarioAgenciaUpdateOneRequiredWithoutHistorialCambiosNestedInput
  }

  export type HistorialCotizacionUncheckedUpdateWithoutCotizacionInput = {
    id?: StringFieldUpdateOperationsInput | string
    cambiadoPorId?: StringFieldUpdateOperationsInput | string
    statusAnterior?: NullableEnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus | null
    statusNuevo?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    nota?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HistorialCotizacionUncheckedUpdateManyWithoutCotizacionInput = {
    id?: StringFieldUpdateOperationsInput | string
    cambiadoPorId?: StringFieldUpdateOperationsInput | string
    statusAnterior?: NullableEnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus | null
    statusNuevo?: EnumCotizacionStatusFieldUpdateOperationsInput | $Enums.CotizacionStatus
    nota?: NullableStringFieldUpdateOperationsInput | string | null
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}