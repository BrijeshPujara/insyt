import React, { useMemo } from "react";
import { FinanceProvider as BaseFinanceProvider } from "@insyt/store";
import { AsyncStorageAdapter } from "@insyt/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";

const storage = new AsyncStorageAdapter(AsyncStorage);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseFinanceProvider storage={storage} supabase={supabase}>
      {children}
    </BaseFinanceProvider>
  );
}
