import { createRealmContext, Realm } from "@realm/react"

import { Historic } from "./schemas/Historic"
import { Coords } from './schemas/Coords';

const realmAccesBehavior: Realm.OpenRealmBehaviorConfiguration = {
    type: Realm.OpenRealmBehaviorType.OpenImmediately
}

export const syncConfig: any = {
    flexible: true,
    newRealmFileBehavior: realmAccesBehavior,
    exisitingRealmFileBehavior: realmAccesBehavior
}

export const { RealmProvider, useRealm, useQuery, useObject } = createRealmContext({ 
    schema: [Historic, Coords],
    schemaVersion: 0 
 })