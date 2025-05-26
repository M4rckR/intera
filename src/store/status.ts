import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

type StatusState = {
  active: boolean;   
  setActive: (active: boolean) => void;
}

export const useStatusStore = create<StatusState>()(
    persist(
        (set)  => ({
            active:false,
            setActive: (active:boolean) => set({
                active
            })
        }),
        {
            name: 'storage-status',
            storage: createJSONStorage(() => sessionStorage)
        }

))