interface Env extends EnvBeforeFixup {
  DO: DurableObjectNamespace<import("./app/do").DrizzleTestDO>;
}
